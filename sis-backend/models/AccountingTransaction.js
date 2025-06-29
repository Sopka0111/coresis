import mongoose from 'mongoose'

const accountingTransactionSchema = new mongoose.Schema({
  // Transaction Reference
  referenceNumber: {
    type: String,
    required: [true, 'Reference number is required'],
    unique: true,
    trim: true
  },
  
  // Student Reference
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    ref: 'Student'
  },
  
  // Transaction Details
  txnType: {
    type: String,
    enum: ['Tuition', 'Payment', 'Refund', 'Fee', 'Scholarship', 'Loan', 'Credit', 'Debit', 'Adjustment'],
    required: [true, 'Transaction type is required']
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
    type: Number
  },
  
  // Payment Method
  method: {
    type: String,
    enum: ['Cash', 'Check', 'Credit Card', 'Debit Card', 'ACH', 'Wire Transfer', 'Loan', 'Scholarship', 'Other'],
    required: [true, 'Payment method is required']
  },
  
  // Ledger Information
  ledgerCode: {
    type: String,
    required: [true, 'Ledger code is required'],
    trim: true
  },
  accountCategory: {
    type: String,
    enum: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'],
    required: [true, 'Account category is required']
  },
  subCategory: {
    type: String,
    trim: true
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ['Settled', 'Pending', 'Overdue', 'Cancelled', 'Disputed', 'Reconciled'],
    default: 'Pending'
  },
  
  // Dates
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  settlementDate: {
    type: Date
  },
  
  // Academic Context
  term: {
    type: String,
    trim: true
  },
  session: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    trim: true
  },
  
  // Payment Details
  paymentReference: {
    type: String,
    trim: true
  },
  checkNumber: {
    type: String,
    trim: true
  },
  cardLastFour: {
    type: String,
    trim: true,
    maxlength: 4
  },
  
  // Reconciliation
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciliationDate: {
    type: Date
  },
  reconciledBy: {
    type: String
  },
  
  // Approval and Authorization
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String
  },
  approvedDate: {
    type: Date
  },
  approvalNotes: {
    type: String,
    trim: true
  },
  
  // Description and Notes
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
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
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Approved', 'Reconciled', 'Cancelled', 'Disputed']
    },
    performedBy: String,
    performedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    previousValues: Object
  }],
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required']
  },
  lastModifiedBy: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
accountingTransactionSchema.index({ referenceNumber: 1 })
accountingTransactionSchema.index({ studentId: 1 })
accountingTransactionSchema.index({ txnType: 1 })
accountingTransactionSchema.index({ status: 1 })
accountingTransactionSchema.index({ transactionDate: -1 })
accountingTransactionSchema.index({ ledgerCode: 1 })
accountingTransactionSchema.index({ reconciled: 1 })

// Virtual for formatted amount
accountingTransactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount)
})

// Virtual for days since transaction
accountingTransactionSchema.virtual('daysSinceTransaction').get(function() {
  const today = new Date()
  const transactionDate = new Date(this.transactionDate)
  const diffTime = today - transactionDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for days overdue
accountingTransactionSchema.virtual('daysOverdue').get(function() {
  if (!this.dueDate || this.status !== 'Overdue') return 0
  
  const today = new Date()
  const dueDate = new Date(this.dueDate)
  const diffTime = today - dueDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to generate reference number
accountingTransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // Get count of transactions for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    
    const count = await this.constructor.countDocuments({
      transactionDate: { $gte: todayStart, $lt: todayEnd }
    })
    
    this.referenceNumber = `TXN-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`
  }
  
  // Set settlement date if status is settled
  if (this.status === 'Settled' && !this.settlementDate) {
    this.settlementDate = new Date()
  }
  
  // Set reconciliation date if reconciled
  if (this.reconciled && !this.reconciliationDate) {
    this.reconciliationDate = new Date()
  }
  
  // Set approval date if approved
  if (this.approved && !this.approvedDate) {
    this.approvedDate = new Date()
  }
  
  next()
})

// Static method to find pending transactions
accountingTransactionSchema.statics.findPending = function() {
  return this.find({
    status: 'Pending',
    isActive: true
  }).sort({ transactionDate: 1 })
}

// Static method to find overdue transactions
accountingTransactionSchema.statics.findOverdue = function() {
  const today = new Date()
  return this.find({
    dueDate: { $lt: today },
    status: { $in: ['Pending', 'Overdue'] },
    isActive: true
  }).sort({ dueDate: 1 })
}

// Static method to find unreconciled transactions
accountingTransactionSchema.statics.findUnreconciled = function() {
  return this.find({
    reconciled: false,
    isActive: true
  }).sort({ transactionDate: -1 })
}

// Static method to get account balance
accountingTransactionSchema.statics.getAccountBalance = function(ledgerCode) {
  return this.aggregate([
    { $match: { ledgerCode, isActive: true } },
    {
      $group: {
        _id: null,
        totalDebits: {
          $sum: {
            $cond: [
              { $in: ['$accountCategory', ['Assets', 'Expenses']] },
              '$amount',
              0
            ]
          }
        },
        totalCredits: {
          $sum: {
            $cond: [
              { $in: ['$accountCategory', ['Liabilities', 'Equity', 'Revenue']] },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ])
}

// Instance method to approve transaction
accountingTransactionSchema.methods.approve = function(approvedBy, notes = '') {
  this.approved = true
  this.approvedBy = approvedBy
  this.approvalNotes = notes
  this.auditTrail.push({
    action: 'Approved',
    performedBy: approvedBy,
    notes
  })
  return this.save()
}

// Instance method to reconcile transaction
accountingTransactionSchema.methods.reconcile = function(reconciledBy) {
  this.reconciled = true
  this.reconciledBy = reconciledBy
  this.auditTrail.push({
    action: 'Reconciled',
    performedBy: reconciledBy
  })
  return this.save()
}

// Instance method to dispute transaction
accountingTransactionSchema.methods.dispute = function(disputedBy, reason) {
  this.status = 'Disputed'
  this.auditTrail.push({
    action: 'Disputed',
    performedBy: disputedBy,
    notes: reason
  })
  return this.save()
}

// Instance method to cancel transaction
accountingTransactionSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'Cancelled'
  this.auditTrail.push({
    action: 'Cancelled',
    performedBy: cancelledBy,
    notes: reason
  })
  return this.save()
}

export default mongoose.model('AccountingTransaction', accountingTransactionSchema) 