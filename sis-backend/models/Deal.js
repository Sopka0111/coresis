import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Financial Information
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Pipeline Information
  stage: {
    type: String,
    enum: ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting'
  },
  pipeline: {
    type: String,
    default: 'Transportation Sales'
  },
  
  // Relationships
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  primaryContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timeline
  expectedCloseDate: {
    type: Date,
    required: true
  },
  actualCloseDate: {
    type: Date
  },
  nextStep: {
    type: String,
    trim: true
  },
  nextStepDate: {
    type: Date
  },
  
  // Product/Service Information
  products: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    description: String
  }],
  serviceType: {
    type: String,
    enum: ['Bus Transportation', 'Special Needs Transport', 'Field Trip Services', 'Athletic Transport', 'Technology Solutions', 'Training Services', 'Other'],
    trim: true
  },
  
  // Lead Source
  leadSource: {
    type: String,
    enum: ['Event', 'Referral', 'Inbound', 'Cold Outreach', 'Website', 'Social Media', 'Advertisement', 'Trade Show', 'Other'],
    trim: true
  },
  
  // Competition and Decision Factors
  competitors: [{
    name: String,
    strengths: String,
    weaknesses: String
  }],
  decisionCriteria: [{
    type: String,
    trim: true
  }],
  
  // Loss Information (for closed lost deals)
  lossReason: {
    type: String,
    enum: ['Price', 'Competition', 'No Budget', 'Timing', 'Product Fit', 'No Decision', 'Other'],
    trim: true
  },
  competitorWon: {
    type: String,
    trim: true
  },
  
  // Contract Information
  contractType: {
    type: String,
    enum: ['Annual', 'Multi-Year', 'One-Time', 'Monthly', 'Per Route', 'Other'],
    trim: true
  },
  contractLength: {
    type: Number, // in months
    min: 1
  },
  renewalDate: {
    type: Date
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Notes and Additional Info
  notes: {
    type: String,
    trim: true
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

// Indexes
dealSchema.index({ assignedTo: 1, stage: 1 });
dealSchema.index({ account: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ value: -1 });

// Virtual for weighted value
dealSchema.virtual('weightedValue').get(function() {
  return this.value * (this.probability / 100);
});

// Virtual for days to close
dealSchema.virtual('daysToClose').get(function() {
  if (!this.expectedCloseDate) return null;
  const diff = this.expectedCloseDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for activities
dealSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'deal'
});

// Static methods
dealSchema.statics.getByStage = function(stage) {
  return this.find({ stage, isActive: true }).populate('account assignedTo primaryContact');
};

dealSchema.statics.getByUser = function(userId) {
  return this.find({ assignedTo: userId, isActive: true }).sort({ expectedCloseDate: 1 });
};

dealSchema.statics.getPipelineValue = function(userId) {
  const pipeline = [
    { $match: { assignedTo: mongoose.Types.ObjectId(userId), isActive: true } },
    { $group: {
      _id: '$stage',
      totalValue: { $sum: '$value' },
      weightedValue: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } },
      count: { $sum: 1 }
    }}
  ];
  return this.aggregate(pipeline);
};

// Instance methods
dealSchema.methods.updateProbability = function() {
  const stageProbabilities = {
    'Prospecting': 10,
    'Qualification': 20,
    'Needs Analysis': 30,
    'Proposal': 50,
    'Negotiation': 70,
    'Decision': 80,
    'Closed Won': 100,
    'Closed Lost': 0
  };
  
  this.probability = stageProbabilities[this.stage] || 50;
  return this.save();
};

dealSchema.methods.moveToNextStage = function() {
  const stages = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Decision'];
  const currentIndex = stages.indexOf(this.stage);
  
  if (currentIndex >= 0 && currentIndex < stages.length - 1) {
    this.stage = stages[currentIndex + 1];
    return this.updateProbability();
  }
  
  return Promise.resolve(this);
};

export default mongoose.model('Deal', dealSchema);