import mongoose from 'mongoose'

const financeRecordSchema = new mongoose.Schema({
  // Student Reference
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    ref: 'Student'
  },
  
  // Transaction Details
  type: {
    type: String,
    enum: ['Tuition', 'Payment', 'Fee', 'Refund', 'Scholarship', 'Loan', 'Credit', 'Debit'],
    required: [true, 'Transaction type is required']
  },
  category: {
    type: String,
    enum: ['Tuition', 'Books', 'Supplies', 'Lab Fees', 'Late Fees', 'Other'],
    default: 'Other'
  },
  
  // Financial Information
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  originalAmount: {
    type: Number
  },
  balance: {
    type: Number,
    default: 0
  },
  
  // Dates
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  paidDate: {
    type: Date
  },
  
  // Academic Information
  term: {
    type: String,
    required: [true, 'Term is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required']
  },
  
  // Funding Information
  fundingSource: {
    type: String,
    enum: ['Self-Pay', 'Federal Aid', 'Private Loan', 'Scholarship', 'Employer', 'Other']
  },
  loanType: {
    type: String,
    enum: ['Direct Subsidized', 'Direct Unsubsidized', 'Direct PLUS', 'Private', 'Other']
  },
  
  // Status and Processing
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Refunded', 'Disputed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Check', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Payment', 'Other']
  },
  
  // Reference Information
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  checkNumber: {
    type: String
  },
  transactionId: {
    type: String
  },
  
  // Notes and Description
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  notes: {
    type: String
  },
  
  // Approval and Processing
  approvedBy: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  processedBy: {
    type: String
  },
  processedAt: {
    type: Date
  },
  
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semester', 'Yearly']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
financeRecordSchema.index({ studentId: 1 })
financeRecordSchema.index({ type: 1 })
financeRecordSchema.index({ status: 1 })
financeRecordSchema.index({ date: -1 })
financeRecordSchema.index({ term: 1, session: 1 })
financeRecordSchema.index({ referenceNumber: 1 })

// Virtual for formatted amount
financeRecordSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount)
})

// Virtual for days overdue
financeRecordSchema.virtual('daysOverdue').get(function() {
  if (this.status !== 'Overdue' || !this.dueDate) return 0
  const today = new Date()
  const dueDate = new Date(this.dueDate)
  const diffTime = today - dueDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to generate reference number
financeRecordSchema.pre('save', async function(next) {
  if (!this.referenceNumber) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const count = await mongoose.model('FinanceRecord').countDocuments()
    this.referenceNumber = `FIN${year}${month}${(count + 1).toString().padStart(6, '0')}`
  }
  
  // Set paid date if status is paid
  if (this.status === 'Paid' && !this.paidDate) {
    this.paidDate = new Date()
  }
  
  next()
})

// Static method to get student balance
financeRecordSchema.statics.getStudentBalance = async function(studentId) {
  const records = await this.find({ 
    studentId, 
    isActive: true,
    status: { $in: ['Pending', 'Overdue'] }
  })
  
  return records.reduce((total, record) => {
    return total + (record.type === 'Payment' ? -record.amount : record.amount)
  }, 0)
}

// Static method to find overdue payments
financeRecordSchema.statics.findOverdue = function() {
  const today = new Date()
  return this.find({
    status: 'Pending',
    dueDate: { $lt: today },
    isActive: true
  })
}

// Instance method to mark as paid
financeRecordSchema.methods.markAsPaid = function(paymentMethod, processedBy) {
  this.status = 'Paid'
  this.paymentMethod = paymentMethod
  this.processedBy = processedBy
  this.processedAt = new Date()
  this.paidDate = new Date()
  return this.save()
}

export default mongoose.model('FinanceRecord', financeRecordSchema) 