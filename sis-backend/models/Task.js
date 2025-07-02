import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Task Details
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'Follow-up', 'Demo', 'Proposal', 'Contract', 'Research', 'Other'],
    default: 'Follow-up'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled', 'Deferred'],
    default: 'Not Started'
  },
  
  // Timeline
  dueDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  actualDuration: {
    type: Number // in minutes
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
  
  // Reminders
  reminderDateTime: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  // Recurrence (for recurring tasks)
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
    trim: true
  },
  recurrenceEnd: {
    type: Date
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Sales', 'Marketing', 'Customer Service', 'Administration', 'Follow-up', 'Other'],
    default: 'Sales'
  },
  
  // Completion Details
  completionNotes: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    enum: ['Successful', 'Unsuccessful', 'Rescheduled', 'No Response', 'Other'],
    trim: true
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ assignedTo: 1, dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ lead: 1 });
taskSchema.index({ account: 1 });
taskSchema.index({ deal: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'Completed' && this.dueDate < new Date();
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (this.status === 'Completed') return null;
  const diff = this.dueDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Static methods
taskSchema.statics.getTasksByUser = function(userId, status = null) {
  const query = { assignedTo: userId, isActive: true };
  if (status) query.status = status;
  return this.find(query).sort({ dueDate: 1 }).populate('lead account contact deal');
};

taskSchema.statics.getOverdueTasks = function(userId = null) {
  const query = {
    dueDate: { $lt: new Date() },
    status: { $nin: ['Completed', 'Cancelled'] },
    isActive: true
  };
  if (userId) query.assignedTo = userId;
  return this.find(query).populate('assignedTo lead account contact deal');
};

taskSchema.statics.getTasksDueToday = function(userId = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    dueDate: { $gte: today, $lt: tomorrow },
    status: { $nin: ['Completed', 'Cancelled'] },
    isActive: true
  };
  if (userId) query.assignedTo = userId;
  return this.find(query).populate('assignedTo lead account contact deal');
};

// Instance methods
taskSchema.methods.markCompleted = function(completionNotes = '', outcome = '') {
  this.status = 'Completed';
  this.completedDate = new Date();
  if (completionNotes) this.completionNotes = completionNotes;
  if (outcome) this.outcome = outcome;
  return this.save();
};

taskSchema.methods.createNextRecurrence = function() {
  if (!this.isRecurring || !this.recurrencePattern) return null;
  
  const nextDueDate = new Date(this.dueDate);
  
  switch (this.recurrencePattern) {
    case 'Daily':
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case 'Weekly':
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case 'Monthly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    case 'Quarterly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 3);
      break;
    case 'Yearly':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      break;
  }
  
  // Check if next occurrence is beyond recurrence end date
  if (this.recurrenceEnd && nextDueDate > this.recurrenceEnd) {
    return null;
  }
  
  const nextTask = new this.constructor({
    title: this.title,
    description: this.description,
    type: this.type,
    priority: this.priority,
    dueDate: nextDueDate,
    assignedTo: this.assignedTo,
    createdBy: this.createdBy,
    lead: this.lead,
    account: this.account,
    contact: this.contact,
    deal: this.deal,
    isRecurring: this.isRecurring,
    recurrencePattern: this.recurrencePattern,
    recurrenceEnd: this.recurrenceEnd,
    parentTask: this.parentTask || this._id,
    tags: this.tags,
    category: this.category,
    estimatedDuration: this.estimatedDuration
  });
  
  return nextTask.save();
};

export default mongoose.model('Task', taskSchema);