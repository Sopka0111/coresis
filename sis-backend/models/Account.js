import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['School District', 'Private School', 'Charter School', 'Transportation Company', 'Vendor', 'Government', 'Other'],
    required: true
  },
  industry: {
    type: String,
    enum: ['K-12 Education', 'Special Needs Transportation', 'Private Education', 'Charter Education', 'Transportation Services', 'Other'],
    default: 'K-12 Education'
  },
  
  // Contact Information
  website: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  // Address Information
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'United States' }
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'United States' }
  },
  
  // School-Specific Information
  studentCount: {
    type: Number,
    min: 0
  },
  schoolCount: {
    type: Number,
    min: 0
  },
  busCount: {
    type: Number,
    min: 0
  },
  routeCount: {
    type: Number,
    min: 0
  },
  grades: [{
    type: String,
    enum: ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Special Needs']
  }],
  
  // Business Information
  annualRevenue: {
    type: Number,
    min: 0
  },
  fiscalYearEnd: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  
  // Relationship Management
  accountOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  territory: {
    type: String,
    trim: true
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Prospect', 'Customer', 'Former Customer'],
    default: 'Prospect'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Financial Tracking
  totalContractValue: {
    type: Number,
    min: 0,
    default: 0
  },
  lastPurchaseDate: {
    type: Date
  },
  nextRenewalDate: {
    type: Date
  },
  
  // Tags and Notes
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
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
accountSchema.index({ accountOwner: 1 });
accountSchema.index({ name: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ territory: 1 });

// Virtual for child accounts
accountSchema.virtual('childAccounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'parentAccount'
});

// Virtual for contacts
accountSchema.virtual('contacts', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'account'
});

// Virtual for deals
accountSchema.virtual('deals', {
  ref: 'Deal',
  localField: '_id',
  foreignField: 'account'
});

// Static methods
accountSchema.statics.getActiveAccounts = function() {
  return this.find({ isActive: true }).populate('accountOwner');
};

accountSchema.statics.getAccountsByOwner = function(userId) {
  return this.find({ accountOwner: userId, isActive: true }).sort({ name: 1 });
};

accountSchema.statics.getAccountsByTerritory = function(territory) {
  return this.find({ territory, isActive: true }).populate('accountOwner');
};

// Instance methods
accountSchema.methods.updateTotalValue = async function() {
  const Deal = mongoose.model('Deal');
  const deals = await Deal.find({ account: this._id, status: 'Closed Won' });
  this.totalContractValue = deals.reduce((total, deal) => total + (deal.value || 0), 0);
  return this.save();
};

export default mongoose.model('Account', accountSchema);