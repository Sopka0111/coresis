import AccountingTransaction from '../models/AccountingTransaction.js'
import Student from '../models/Student.js'
import { validationResult } from 'express-validator'

// Get all transactions with filtering and pagination
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      txnType,
      status,
      ledgerCode,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      reconciled,
      approved,
      search,
      sortBy = 'transactionDate',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (studentId) filter.studentId = studentId
    if (txnType) filter.txnType = txnType
    if (status) filter.status = status
    if (ledgerCode) filter.ledgerCode = ledgerCode
    if (reconciled !== undefined) filter.reconciled = reconciled === 'true'
    if (approved !== undefined) filter.approved = approved === 'true'
    
    if (startDate || endDate) {
      filter.transactionDate = {}
      if (startDate) filter.transactionDate.$gte = new Date(startDate)
      if (endDate) filter.transactionDate.$lte = new Date(endDate)
    }
    
    if (minAmount || maxAmount) {
      filter.amount = {}
      if (minAmount) filter.amount.$gte = parseFloat(minAmount)
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount)
    }
    
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { paymentReference: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Execute query with pagination
    const transactions = await AccountingTransaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const total = await AccountingTransaction.countDocuments(filter)

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    })
  }
}

// Get single transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params
    
    const transaction = await AccountingTransaction.findById(id)
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    res.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    })
  }
}

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const transactionData = req.body
    
    // Verify student exists
    const student = await Student.findOne({ studentId: transactionData.studentId })
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      })
    }

    const newTransaction = new AccountingTransaction({
      ...transactionData,
      createdBy: req.user?.id || 'system'
    })
    await newTransaction.save()

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    })
  }
}

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const updatedTransaction = await AccountingTransaction.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastModifiedBy: req.user?.id || 'system'
      },
      { new: true, runValidators: true }
    )

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    })
  }
}

// Delete transaction (soft delete)
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const transaction = await AccountingTransaction.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        lastModifiedBy: req.user?.id || 'system'
      },
      { new: true }
    )

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message
    })
  }
}

// Approve transaction
export const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    const transaction = await AccountingTransaction.findById(id)
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    await transaction.approve(req.user?.id || 'system', notes)

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: transaction
    })
  } catch (error) {
    console.error('Error approving transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to approve transaction',
      error: error.message
    })
  }
}

// Reconcile transaction
export const reconcileTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const transaction = await AccountingTransaction.findById(id)
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    await transaction.reconcile(req.user?.id || 'system')

    res.json({
      success: true,
      message: 'Transaction reconciled successfully',
      data: transaction
    })
  } catch (error) {
    console.error('Error reconciling transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reconcile transaction',
      error: error.message
    })
  }
}

// Dispute transaction
export const disputeTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const transaction = await AccountingTransaction.findById(id)
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    await transaction.dispute(req.user?.id || 'system', reason)

    res.json({
      success: true,
      message: 'Transaction disputed successfully',
      data: transaction
    })
  } catch (error) {
    console.error('Error disputing transaction:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to dispute transaction',
      error: error.message
    })
  }
}

// Get pending transactions
export const getPendingTransactions = async (req, res) => {
  try {
    const pendingTransactions = await AccountingTransaction.findPending()

    res.json({
      success: true,
      data: pendingTransactions,
      count: pendingTransactions.length
    })
  } catch (error) {
    console.error('Error fetching pending transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending transactions',
      error: error.message
    })
  }
}

// Get overdue transactions
export const getOverdueTransactions = async (req, res) => {
  try {
    const overdueTransactions = await AccountingTransaction.findOverdue()

    res.json({
      success: true,
      data: overdueTransactions,
      count: overdueTransactions.length
    })
  } catch (error) {
    console.error('Error fetching overdue transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue transactions',
      error: error.message
    })
  }
}

// Get unreconciled transactions
export const getUnreconciledTransactions = async (req, res) => {
  try {
    const unreconciledTransactions = await AccountingTransaction.findUnreconciled()

    res.json({
      success: true,
      data: unreconciledTransactions,
      count: unreconciledTransactions.length
    })
  } catch (error) {
    console.error('Error fetching unreconciled transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unreconciled transactions',
      error: error.message
    })
  }
}

// Get account balance
export const getAccountBalance = async (req, res) => {
  try {
    const { ledgerCode } = req.params

    const balance = await AccountingTransaction.getAccountBalance(ledgerCode)
    const balanceData = balance[0] || { totalDebits: 0, totalCredits: 0 }
    
    const netBalance = balanceData.totalCredits - balanceData.totalDebits

    res.json({
      success: true,
      data: {
        ledgerCode,
        totalDebits: balanceData.totalDebits,
        totalCredits: balanceData.totalCredits,
        netBalance,
        formattedBalance: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(netBalance)
      }
    })
  } catch (error) {
    console.error('Error fetching account balance:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account balance',
      error: error.message
    })
  }
}

// Get accounting statistics
export const getAccountingStats = async (req, res) => {
  try {
    const { startDate, endDate, ledgerCode } = req.query

    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.transactionDate = {}
      if (startDate) dateFilter.transactionDate.$gte = new Date(startDate)
      if (endDate) dateFilter.transactionDate.$lte = new Date(endDate)
    }

    let additionalFilter = {}
    if (ledgerCode) additionalFilter.ledgerCode = ledgerCode

    const filter = { isActive: true, ...dateFilter, ...additionalFilter }

    // Overall statistics
    const stats = await AccountingTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          pendingAmount: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Pending'] },
                '$amount',
                0
              ]
            }
          },
          overdueAmount: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Overdue'] },
                '$amount',
                0
              ]
            }
          },
          reconciledAmount: {
            $sum: {
              $cond: [
                '$reconciled',
                '$amount',
                0
              ]
            }
          }
        }
      }
    ])

    // Transaction type breakdown
    const typeBreakdown = await AccountingTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$txnType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    // Status breakdown
    const statusBreakdown = await AccountingTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    // Payment method breakdown
    const methodBreakdown = await AccountingTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    // Monthly trends
    const monthlyTrends = await AccountingTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          transactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          reconciledAmount: 0
        },
        typeBreakdown,
        statusBreakdown,
        methodBreakdown,
        monthlyTrends
      }
    })
  } catch (error) {
    console.error('Error fetching accounting stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounting statistics',
      error: error.message
    })
  }
}

// Bulk operations
export const bulkUpdateTransactions = async (req, res) => {
  try {
    const { transactionIds, updates } = req.body

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transaction IDs array is required'
      })
    }

    const result = await AccountingTransaction.updateMany(
      { _id: { $in: transactionIds } },
      {
        ...updates,
        lastModifiedBy: req.user?.id || 'system'
      }
    )

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} transactions`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    })
  } catch (error) {
    console.error('Error in bulk update:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update',
      error: error.message
    })
  }
}

// Export transactions
export const exportTransactions = async (req, res) => {
  try {
    const { format = 'json', filters } = req.query
    
    let filter = { isActive: true }
    
    if (filters) {
      const parsedFilters = JSON.parse(filters)
      filter = { ...filter, ...parsedFilters }
    }

    const transactions = await AccountingTransaction.find(filter).select('-__v')

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = transactions.map(transaction => ({
        'Reference Number': transaction.referenceNumber,
        'Student ID': transaction.studentId,
        'Type': transaction.txnType,
        'Amount': transaction.amount,
        'Method': transaction.method,
        'Ledger Code': transaction.ledgerCode,
        'Status': transaction.status,
        'Transaction Date': transaction.transactionDate,
        'Description': transaction.description,
        'Reconciled': transaction.reconciled,
        'Approved': transaction.approved
      }))

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=accounting_transactions.csv')
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      res.send(csvString)
    } else {
      res.json({
        success: true,
        data: transactions,
        count: transactions.length
      })
    }
  } catch (error) {
    console.error('Error exporting transactions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions',
      error: error.message
    })
  }
} 