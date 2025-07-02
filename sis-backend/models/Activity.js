import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  // Basic Information
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Note', 'Task', 'Demo', 'Proposal', 'Contract', 'Follow-up', 'SMS', 'Social Media', 'Other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Activity Details
  direction: {
    type: String,
    enum: ['Inbound', 'Outbound'],
    default: 'Outbound'
  },
  status: {
    type: String,
    enum: ['Planned', 'Completed', 'Cancelled', 'No Show'],
    default: 'Completed'
  },
  outcome: {
    type: String,
    enum: ['Successful', 'Unsuccessful', 'Left Voicemail', 'No Answer', 'Busy', 'Connected', 'Interested', 'Not Interested', 'Callback Requested', 'Other'],
    trim: true
  },
  
  // Timeline
  activityDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Related Records
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  
  // Communication Details
  emailData: {
    to: [String],
    cc: [String],
    bcc: [String],
    messageId: String,
    emailSent: { type: Boolean, default: false },
    emailOpened: { type: Boolean, default: false },
    emailClicked: { type: Boolean, default: false },
    bounced: { type: Boolean, default: false }
  },
  phoneData: {
    phoneNumber: String,
    callDuration: Number, // in seconds
    recording: String, // URL to call recording
    voicemailLeft: { type: Boolean, default: false }
  },
  meetingData: {
    location: String,
    attendees: [String],
    meetingUrl: String,
    agenda: String
  },
  
  // Assignment and Ownership
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  
  // Follow-up Information
  requiresFollowUp: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true
  },
  
  // Attachments and Files
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ activityDate: -1 });
activitySchema.index({ assignedTo: 1, activityDate: -1 });
activitySchema.index({ lead: 1, activityDate: -1 });
activitySchema.index({ account: 1, activityDate: -1 });
activitySchema.index({ contact: 1, activityDate: -1 });
activitySchema.index({ deal: 1, activityDate: -1 });
activitySchema.index({ type: 1 });

// Virtual for activity age
activitySchema.virtual('daysAgo').get(function() {
  const diff = new Date() - this.activityDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Static methods
activitySchema.statics.getActivitiesByUser = function(userId, limit = 50) {
  return this.find({ assignedTo: userId, isActive: true })
    .sort({ activityDate: -1 })
    .limit(limit)
    .populate('lead account contact deal task');
};

activitySchema.statics.getActivitiesByLead = function(leadId) {
  return this.find({ lead: leadId, isActive: true })
    .sort({ activityDate: -1 })
    .populate('assignedTo createdBy');
};

activitySchema.statics.getActivitiesByAccount = function(accountId) {
  return this.find({ account: accountId, isActive: true })
    .sort({ activityDate: -1 })
    .populate('assignedTo createdBy contact');
};

activitySchema.statics.getActivitiesByDeal = function(dealId) {
  return this.find({ deal: dealId, isActive: true })
    .sort({ activityDate: -1 })
    .populate('assignedTo createdBy contact');
};

activitySchema.statics.getRecentActivities = function(days = 7, userId = null) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const query = { 
    activityDate: { $gte: cutoffDate },
    isActive: true 
  };
  
  if (userId) query.assignedTo = userId;
  
  return this.find(query)
    .sort({ activityDate: -1 })
    .populate('assignedTo lead account contact deal');
};

activitySchema.statics.getActivityStats = function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        assignedTo: mongoose.Types.ObjectId(userId),
        activityDate: { $gte: startDate, $lte: endDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Instance methods
activitySchema.methods.createFollowUpTask = function() {
  if (!this.requiresFollowUp || !this.followUpDate) return null;
  
  const Task = mongoose.model('Task');
  const followUpTask = new Task({
    title: `Follow up on ${this.subject}`,
    description: this.followUpNotes || `Follow up on ${this.type.toLowerCase()} activity`,
    type: 'Follow-up',
    dueDate: this.followUpDate,
    assignedTo: this.assignedTo,
    createdBy: this.createdBy,
    lead: this.lead,
    account: this.account,
    contact: this.contact,
    deal: this.deal
  });
  
  return followUpTask.save();
};

activitySchema.methods.markEmailOpened = function() {
  if (this.type === 'Email' && this.emailData) {
    this.emailData.emailOpened = true;
    return this.save();
  }
  return Promise.resolve(this);
};

activitySchema.methods.markEmailClicked = function() {
  if (this.type === 'Email' && this.emailData) {
    this.emailData.emailClicked = true;
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.model('Activity', activitySchema);