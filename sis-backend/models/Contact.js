import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
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
  mobile: {
    type: String,
    trim: true
  },
  
  // Professional Information
  jobTitle: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    enum: ['Transportation', 'Administration', 'Finance', 'Operations', 'IT', 'Purchasing', 'Special Needs', 'Other'],
    trim: true
  },
  
  // Account Relationship
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  
  // Contact Role and Authority
  role: {
    type: String,
    enum: ['Decision Maker', 'Influencer', 'User', 'Gatekeeper', 'Champion', 'Other'],
    default: 'User'
  },
  decisionMakingAuthority: {
    type: String,
    enum: ['Final Decision Maker', 'Recommends', 'Influences', 'Uses', 'Blocks', 'Unknown'],
    default: 'Unknown'
  },
  
  // Communication Preferences
  preferredContact: {
    type: String,
    enum: ['Email', 'Phone', 'Mobile', 'Text', 'In-Person'],
    default: 'Email'
  },
  emailOptOut: {
    type: Boolean,
    default: false
  },
  callOptOut: {
    type: Boolean,
    default: false
  },
  textOptOut: {
    type: Boolean,
    default: false
  },
  
  // Address Information
  mailingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'United States' }
  },
  
  // Personal Information
  birthday: {
    type: Date
  },
  timeZone: {
    type: String,
    default: 'America/New_York'
  },
  
  // Social Media and Additional Contact
  linkedIn: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },
  
  // Relationship Management
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Lead Source (if converted from lead)
  leadSource: {
    type: String,
    enum: ['Event', 'Referral', 'Inbound', 'Cold Outreach', 'Website', 'Social Media', 'Advertisement', 'Trade Show', 'Other'],
    trim: true
  },
  
  // Engagement Tracking
  lastContactDate: {
    type: Date
  },
  lastEmailDate: {
    type: Date
  },
  emailEngagementScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  
  // Notes and Additional Info
  notes: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
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
contactSchema.index({ account: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ role: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for activities
contactSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'contact'
});

// Static methods
contactSchema.statics.getByAccount = function(accountId) {
  return this.find({ account: accountId, isActive: true }).populate('assignedTo');
};

contactSchema.statics.getDecisionMakers = function(accountId) {
  return this.find({ 
    account: accountId, 
    role: 'Decision Maker',
    isActive: true 
  }).populate('assignedTo');
};

contactSchema.statics.getPrimaryContacts = function() {
  return this.find({ isPrimary: true, isActive: true }).populate('account assignedTo');
};

// Instance methods
contactSchema.methods.updateEngagementScore = function() {
  let score = 0;
  
  // Base score for having contact information
  if (this.email) score += 20;
  if (this.phone) score += 10;
  if (this.mobile) score += 10;
  
  // Score for recent engagement
  if (this.lastContactDate) {
    const daysSinceContact = (Date.now() - this.lastContactDate) / (1000 * 60 * 60 * 24);
    if (daysSinceContact < 7) score += 30;
    else if (daysSinceContact < 30) score += 20;
    else if (daysSinceContact < 90) score += 10;
  }
  
  // Score for role importance
  if (this.role === 'Decision Maker') score += 30;
  else if (this.role === 'Influencer') score += 20;
  else if (this.role === 'Champion') score += 25;
  
  this.emailEngagementScore = Math.min(score, 100);
  return this.save();
};

export default mongoose.model('Contact', contactSchema);