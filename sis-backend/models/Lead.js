import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  
  // Lead Status and Pipeline
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New'
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Lead Source and Attribution
  source: {
    type: String,
    enum: ['Event', 'Referral', 'Inbound', 'Cold Outreach', 'Website', 'Social Media', 'Advertisement', 'Trade Show', 'Other'],
    required: true
  },
  sourceDetails: {
    type: String,
    trim: true
  },
  
  // School/Organization Information
  schoolDistrict: {
    type: String,
    trim: true
  },
  schoolType: {
    type: String,
    enum: ['Public Elementary', 'Public Middle', 'Public High', 'Private School', 'Charter School', 'District Office', 'Other'],
    trim: true
  },
  studentCount: {
    type: Number,
    min: 0
  },
  busCount: {
    type: Number,
    min: 0
  },
  
  // Geographic Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'United States' }
  },
  territory: {
    type: String,
    trim: true
  },
  
  // Assignment and Ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Communication Preferences
  preferredContact: {
    type: String,
    enum: ['Email', 'Phone', 'Text', 'In-Person'],
    default: 'Email'
  },
  timeZone: {
    type: String,
    default: 'America/New_York'
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  industry: {
    type: String,
    enum: ['K-12 Education', 'Special Needs', 'Private School', 'Charter School', 'District Transportation', 'Other'],
    default: 'K-12 Education'
  },
  
  // Financial Information
  estimatedValue: {
    type: Number,
    min: 0
  },
  budgetRange: {
    type: String,
    enum: ['Under $10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', '$500K+', 'Unknown']
  },
  
  // Timeline
  expectedCloseDate: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  },
  lastContactDate: {
    type: Date
  },
  
  // Qualification Information
  decisionMaker: {
    type: Boolean,
    default: false
  },
  budget: {
    type: Boolean,
    default: false
  },
  need: {
    type: Boolean,
    default: false
  },
  timeline: {
    type: Boolean,
    default: false
  },
  
  // Notes and Additional Info
  notes: {
    type: String,
    trim: true
  },
  lostReason: {
    type: String,
    enum: ['Price', 'Competition', 'No Budget', 'Timing', 'No Need', 'Other'],
    trim: true
  },
  
  // Conversion Tracking
  convertedToAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  convertedAt: {
    type: Date
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ territory: 1 });

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Static methods
leadSchema.statics.getLeadsByStatus = function(status) {
  return this.find({ status, isActive: true }).populate('assignedTo createdBy');
};

leadSchema.statics.getLeadsByUser = function(userId) {
  return this.find({ assignedTo: userId, isActive: true }).sort({ createdAt: -1 });
};

// Instance methods
leadSchema.methods.updateScore = function() {
  let score = 0;
  
  // Score based on qualification criteria
  if (this.decisionMaker) score += 25;
  if (this.budget) score += 25;
  if (this.need) score += 25;
  if (this.timeline) score += 25;
  
  // Bonus points for engagement
  if (this.lastContactDate && Date.now() - this.lastContactDate < 7 * 24 * 60 * 60 * 1000) {
    score += 10; // Recent contact
  }
  
  this.leadScore = Math.min(score, 100);
  return this.save();
};

export default mongoose.model('Lead', leadSchema);