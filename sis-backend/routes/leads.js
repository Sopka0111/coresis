import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Lead from '../models/Lead.js';
import Account from '../models/Account.js';
import Contact from '../models/Contact.js';
import Activity from '../models/Activity.js';
import { verifyToken, filterUserRecords, checkRecordAccess } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Get all leads with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
  query('source').optional().isIn(['Event', 'Referral', 'Inbound', 'Cold Outreach', 'Website', 'Social Media', 'Advertisement', 'Trade Show', 'Other']),
  query('assignedTo').optional().isMongoId(),
  query('territory').optional().isString(),
  query('search').optional().isString()
], filterUserRecords, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { ...req.userFilter, isActive: true };
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.territory) filter.territory = req.query.territory;
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { schoolDistrict: searchRegex }
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
});

// Get single lead by ID
router.get('/:id', checkRecordAccess(Lead), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName')
      .populate('convertedToAccount', 'name type');

    if (!lead || !lead.isActive) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Get recent activities for this lead
    const activities = await Activity.find({ lead: lead._id, isActive: true })
      .populate('assignedTo', 'firstName lastName')
      .sort({ activityDate: -1 })
      .limit(10);

    res.json({ lead, activities });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error while fetching lead' });
  }
});

// Create new lead
router.post('/', [
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('source').isIn(['Event', 'Referral', 'Inbound', 'Cold Outreach', 'Website', 'Social Media', 'Advertisement', 'Trade Show', 'Other']),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('position').optional().trim(),
  body('schoolDistrict').optional().trim(),
  body('schoolType').optional().isIn(['Public Elementary', 'Public Middle', 'Public High', 'Private School', 'Charter School', 'District Office', 'Other']),
  body('assignedTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if lead with this email already exists
    const existingLead = await Lead.findOne({ 
      email: req.body.email, 
      isActive: true 
    });
    
    if (existingLead) {
      return res.status(400).json({ message: 'A lead with this email already exists' });
    }

    const leadData = {
      ...req.body,
      assignedTo: req.body.assignedTo || req.user._id,
      createdBy: req.user._id
    };

    const lead = new Lead(leadData);
    await lead.save();
    
    // Populate the created lead
    await lead.populate('assignedTo', 'firstName lastName email');
    await lead.populate('createdBy', 'firstName lastName');

    // Create initial activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Lead Created',
      description: `Lead created from ${lead.source}`,
      lead: lead._id,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    res.status(201).json({ 
      message: 'Lead created successfully', 
      lead 
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error while creating lead' });
  }
});

// Update lead
router.put('/:id', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
  body('assignedTo').optional().isMongoId()
], checkRecordAccess(Lead), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead || !lead.isActive) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Track status changes for activity log
    const oldStatus = lead.status;
    const newStatus = req.body.status;

    // Update lead
    Object.assign(lead, req.body);
    lead.updatedBy = req.user._id;
    await lead.save();

    // Create activity for status change
    if (oldStatus !== newStatus && newStatus) {
      const activity = new Activity({
        type: 'Note',
        subject: 'Lead Status Updated',
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        lead: lead._id,
        assignedTo: lead.assignedTo,
        createdBy: req.user._id
      });
      await activity.save();
    }

    await lead.populate('assignedTo', 'firstName lastName email');
    await lead.populate('updatedBy', 'firstName lastName');

    res.json({ 
      message: 'Lead updated successfully', 
      lead 
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error while updating lead' });
  }
});

// Convert lead to account and contact
router.post('/:id/convert', [
  body('accountName').trim().isLength({ min: 1 }),
  body('accountType').isIn(['School District', 'Private School', 'Charter School', 'Transportation Company', 'Vendor', 'Government', 'Other'])
], checkRecordAccess(Lead), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead || !lead.isActive) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.convertedToAccount) {
      return res.status(400).json({ message: 'Lead has already been converted' });
    }

    // Create account
    const account = new Account({
      name: req.body.accountName,
      type: req.body.accountType,
      industry: lead.industry,
      phone: lead.phone,
      email: lead.email,
      studentCount: lead.studentCount,
      busCount: lead.busCount,
      billingAddress: lead.address,
      shippingAddress: lead.address,
      accountOwner: lead.assignedTo,
      territory: lead.territory,
      status: 'Prospect',
      tags: lead.tags,
      description: `Converted from lead: ${lead.firstName} ${lead.lastName}`,
      createdBy: req.user._id
    });
    await account.save();

    // Create contact
    const contact = new Contact({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      jobTitle: lead.position,
      account: account._id,
      assignedTo: lead.assignedTo,
      leadSource: lead.source,
      isPrimary: true,
      tags: lead.tags,
      notes: lead.notes,
      createdBy: req.user._id
    });
    await contact.save();

    // Update lead
    lead.convertedToAccount = account._id;
    lead.convertedAt = new Date();
    lead.status = 'Closed Won';
    await lead.save();

    // Create conversion activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Lead Converted',
      description: `Lead converted to Account: ${account.name} and Contact: ${contact.fullName}`,
      lead: lead._id,
      account: account._id,
      contact: contact._id,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    await account.populate('accountOwner', 'firstName lastName');
    await contact.populate('assignedTo', 'firstName lastName');

    res.json({
      message: 'Lead converted successfully',
      account,
      contact,
      lead
    });
  } catch (error) {
    console.error('Convert lead error:', error);
    res.status(500).json({ message: 'Server error while converting lead' });
  }
});

// Update lead score
router.put('/:id/score', checkRecordAccess(Lead), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || !lead.isActive) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.updateScore();
    
    res.json({ 
      message: 'Lead score updated successfully', 
      leadScore: lead.leadScore 
    });
  } catch (error) {
    console.error('Update lead score error:', error);
    res.status(500).json({ message: 'Server error while updating lead score' });
  }
});

// Delete lead (soft delete)
router.delete('/:id', checkRecordAccess(Lead), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || !lead.isActive) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.isActive = false;
    lead.updatedBy = req.user._id;
    await lead.save();

    // Create deletion activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Lead Deleted',
      description: 'Lead was deleted from the system',
      lead: lead._id,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error while deleting lead' });
  }
});

// Get lead statistics
router.get('/stats/summary', filterUserRecords, async (req, res) => {
  try {
    const pipeline = [
      { $match: { ...req.userFilter, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      }
    ];

    const stats = await Lead.aggregate(pipeline);
    
    const summary = {
      total: 0,
      totalValue: 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary.totalValue += stat.totalValue || 0;
      summary.byStatus[stat._id] = {
        count: stat.count,
        value: stat.totalValue || 0
      };
    });

    res.json({ summary });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({ message: 'Server error while fetching lead statistics' });
  }
});

export default router;