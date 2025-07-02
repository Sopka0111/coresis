import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Deal from '../models/Deal.js';
import Account from '../models/Account.js';
import Contact from '../models/Contact.js';
import Activity from '../models/Activity.js';
import Task from '../models/Task.js';
import { verifyToken, filterUserRecords, checkRecordAccess } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Get all deals with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('stage').optional().isIn(['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision', 'Closed Won', 'Closed Lost']),
  query('assignedTo').optional().isMongoId(),
  query('minValue').optional().isFloat({ min: 0 }),
  query('maxValue').optional().isFloat({ min: 0 }),
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
    
    if (req.query.stage) filter.stage = req.query.stage;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    
    if (req.query.minValue || req.query.maxValue) {
      filter.value = {};
      if (req.query.minValue) filter.value.$gte = parseFloat(req.query.minValue);
      if (req.query.maxValue) filter.value.$lte = parseFloat(req.query.maxValue);
    }
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const deals = await Deal.find(filter)
      .populate('account', 'name type')
      .populate('primaryContact', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ expectedCloseDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Deal.countDocuments(filter);

    res.json({
      deals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Server error while fetching deals' });
  }
});

// Get deals by pipeline stage (Kanban view)
router.get('/kanban', filterUserRecords, async (req, res) => {
  try {
    const stages = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision'];
    const kanbanData = {};

    for (const stage of stages) {
      const deals = await Deal.find({
        ...req.userFilter,
        stage,
        isActive: true
      })
      .populate('account', 'name type')
      .populate('primaryContact', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ expectedCloseDate: 1 });

      kanbanData[stage] = deals;
    }

    res.json({ kanban: kanbanData });
  } catch (error) {
    console.error('Get kanban error:', error);
    res.status(500).json({ message: 'Server error while fetching kanban data' });
  }
});

// Get single deal by ID
router.get('/:id', checkRecordAccess(Deal), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('account', 'name type industry phone email')
      .populate('primaryContact', 'firstName lastName email phone jobTitle')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName');

    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Get recent activities for this deal
    const activities = await Activity.find({ deal: deal._id, isActive: true })
      .populate('assignedTo', 'firstName lastName')
      .populate('contact', 'firstName lastName')
      .sort({ activityDate: -1 })
      .limit(15);

    // Get open tasks for this deal
    const tasks = await Task.find({ 
      deal: deal._id, 
      status: { $nin: ['Completed', 'Cancelled'] },
      isActive: true 
    })
      .populate('assignedTo', 'firstName lastName')
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({ deal, activities, tasks });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ message: 'Server error while fetching deal' });
  }
});

// Create new deal
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('value').isFloat({ min: 0 }),
  body('account').isMongoId(),
  body('expectedCloseDate').isISO8601(),
  body('stage').optional().isIn(['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision']),
  body('primaryContact').optional().isMongoId(),
  body('assignedTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify account exists and user has access
    const account = await Account.findById(req.body.account);
    if (!account || !account.isActive) {
      return res.status(400).json({ message: 'Invalid account' });
    }

    // Verify contact belongs to account if provided
    if (req.body.primaryContact) {
      const contact = await Contact.findById(req.body.primaryContact);
      if (!contact || contact.account.toString() !== req.body.account) {
        return res.status(400).json({ message: 'Contact does not belong to the specified account' });
      }
    }

    const dealData = {
      ...req.body,
      assignedTo: req.body.assignedTo || req.user._id,
      createdBy: req.user._id
    };

    const deal = new Deal(dealData);
    await deal.updateProbability(); // Set probability based on stage
    await deal.save();
    
    // Populate the created deal
    await deal.populate('account', 'name type');
    await deal.populate('primaryContact', 'firstName lastName email');
    await deal.populate('assignedTo', 'firstName lastName email');

    // Create initial activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Deal Created',
      description: `Deal "${deal.name}" created with value $${deal.value.toLocaleString()}`,
      deal: deal._id,
      account: deal.account,
      contact: deal.primaryContact,
      assignedTo: deal.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    res.status(201).json({ 
      message: 'Deal created successfully', 
      deal 
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ message: 'Server error while creating deal' });
  }
});

// Update deal
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('value').optional().isFloat({ min: 0 }),
  body('stage').optional().isIn(['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision', 'Closed Won', 'Closed Lost']),
  body('expectedCloseDate').optional().isISO8601(),
  body('probability').optional().isInt({ min: 0, max: 100 })
], checkRecordAccess(Deal), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Track stage changes for activity log
    const oldStage = deal.stage;
    const newStage = req.body.stage;
    const oldValue = deal.value;
    const newValue = req.body.value;

    // Update deal
    Object.assign(deal, req.body);
    deal.updatedBy = req.user._id;

    // Handle stage changes
    if (newStage && oldStage !== newStage) {
      if (newStage === 'Closed Won') {
        deal.actualCloseDate = new Date();
      } else if (newStage === 'Closed Lost') {
        deal.actualCloseDate = new Date();
      }
      
      // Update probability based on new stage
      await deal.updateProbability();
    }

    await deal.save();

    // Create activities for significant changes
    if (oldStage !== newStage && newStage) {
      const activity = new Activity({
        type: 'Note',
        subject: 'Deal Stage Updated',
        description: `Stage changed from ${oldStage} to ${newStage}`,
        deal: deal._id,
        account: deal.account,
        contact: deal.primaryContact,
        assignedTo: deal.assignedTo,
        createdBy: req.user._id
      });
      await activity.save();
    }

    if (oldValue !== newValue && newValue) {
      const activity = new Activity({
        type: 'Note',
        subject: 'Deal Value Updated',
        description: `Value changed from $${oldValue?.toLocaleString() || 0} to $${newValue.toLocaleString()}`,
        deal: deal._id,
        account: deal.account,
        contact: deal.primaryContact,
        assignedTo: deal.assignedTo,
        createdBy: req.user._id
      });
      await activity.save();
    }

    await deal.populate('account', 'name type');
    await deal.populate('primaryContact', 'firstName lastName email');
    await deal.populate('assignedTo', 'firstName lastName email');

    res.json({ 
      message: 'Deal updated successfully', 
      deal 
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ message: 'Server error while updating deal' });
  }
});

// Move deal to next stage
router.put('/:id/advance-stage', checkRecordAccess(Deal), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const oldStage = deal.stage;
    await deal.moveToNextStage();
    
    // Create activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Deal Advanced',
      description: `Deal advanced from ${oldStage} to ${deal.stage}`,
      deal: deal._id,
      account: deal.account,
      contact: deal.primaryContact,
      assignedTo: deal.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    await deal.populate('account', 'name type');
    await deal.populate('assignedTo', 'firstName lastName');

    res.json({ 
      message: 'Deal stage advanced successfully', 
      deal 
    });
  } catch (error) {
    console.error('Advance deal stage error:', error);
    res.status(500).json({ message: 'Server error while advancing deal stage' });
  }
});

// Close deal as won
router.put('/:id/close-won', [
  body('actualValue').optional().isFloat({ min: 0 }),
  body('notes').optional().trim()
], checkRecordAccess(Deal), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.stage = 'Closed Won';
    deal.probability = 100;
    deal.actualCloseDate = new Date();
    if (req.body.actualValue) deal.value = req.body.actualValue;
    if (req.body.notes) deal.notes = req.body.notes;
    deal.updatedBy = req.user._id;
    
    await deal.save();

    // Update account total value
    const account = await Account.findById(deal.account);
    if (account) {
      await account.updateTotalValue();
    }

    // Create activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Deal Closed Won',
      description: `Deal closed as won with value $${deal.value.toLocaleString()}. ${req.body.notes || ''}`,
      deal: deal._id,
      account: deal.account,
      contact: deal.primaryContact,
      assignedTo: deal.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    await deal.populate('account', 'name type');
    await deal.populate('assignedTo', 'firstName lastName');

    res.json({ 
      message: 'Deal closed as won successfully', 
      deal 
    });
  } catch (error) {
    console.error('Close deal won error:', error);
    res.status(500).json({ message: 'Server error while closing deal as won' });
  }
});

// Close deal as lost
router.put('/:id/close-lost', [
  body('lossReason').isIn(['Price', 'Competition', 'No Budget', 'Timing', 'Product Fit', 'No Decision', 'Other']),
  body('competitorWon').optional().trim(),
  body('notes').optional().trim()
], checkRecordAccess(Deal), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.stage = 'Closed Lost';
    deal.probability = 0;
    deal.actualCloseDate = new Date();
    deal.lossReason = req.body.lossReason;
    if (req.body.competitorWon) deal.competitorWon = req.body.competitorWon;
    if (req.body.notes) deal.notes = req.body.notes;
    deal.updatedBy = req.user._id;
    
    await deal.save();

    // Create activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Deal Closed Lost',
      description: `Deal closed as lost. Reason: ${deal.lossReason}. ${deal.competitorWon ? `Competitor: ${deal.competitorWon}. ` : ''}${req.body.notes || ''}`,
      deal: deal._id,
      account: deal.account,
      contact: deal.primaryContact,
      assignedTo: deal.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    await deal.populate('account', 'name type');
    await deal.populate('assignedTo', 'firstName lastName');

    res.json({ 
      message: 'Deal closed as lost successfully', 
      deal 
    });
  } catch (error) {
    console.error('Close deal lost error:', error);
    res.status(500).json({ message: 'Server error while closing deal as lost' });
  }
});

// Get deal pipeline statistics
router.get('/stats/pipeline', filterUserRecords, async (req, res) => {
  try {
    const pipeline = [
      { $match: { ...req.userFilter, isActive: true } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          weightedValue: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } }
        }
      }
    ];

    const stats = await Deal.aggregate(pipeline);
    
    const summary = {
      total: 0,
      totalValue: 0,
      weightedValue: 0,
      byStage: {}
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary.totalValue += stat.totalValue || 0;
      summary.weightedValue += stat.weightedValue || 0;
      summary.byStage[stat._id] = {
        count: stat.count,
        value: stat.totalValue || 0,
        weightedValue: stat.weightedValue || 0
      };
    });

    res.json({ summary });
  } catch (error) {
    console.error('Get pipeline stats error:', error);
    res.status(500).json({ message: 'Server error while fetching pipeline statistics' });
  }
});

// Delete deal (soft delete)
router.delete('/:id', checkRecordAccess(Deal), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.isActive = false;
    deal.updatedBy = req.user._id;
    await deal.save();

    // Create deletion activity
    const activity = new Activity({
      type: 'Note',
      subject: 'Deal Deleted',
      description: 'Deal was deleted from the system',
      deal: deal._id,
      account: deal.account,
      assignedTo: deal.assignedTo,
      createdBy: req.user._id
    });
    await activity.save();

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ message: 'Server error while deleting deal' });
  }
});

export default router;