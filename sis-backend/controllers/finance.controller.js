import FinanceRecord from '../models/FinanceRecord.js'
import Student from '../models/Student.js'
import { validationResult } from 'express-validator'

// Get all finance records with filtering and pagination
export const getFinanceRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      type,
      status,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (studentId) filter.studentId = studentId
    if (type) filter.type = type
    if (status) filter.status = status
    if (category) filter.category = category
    
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    
    if (minAmount || maxAmount) {
      filter.amount = {}
      if (minAmount) filter.amount.$gte = parseFloat(minAmount)
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount)
    }
    
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Execute query with pagination
    const records = await FinanceRecord.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const total = await FinanceRecord.countDocuments(filter)

    res.json({
      success: true,
      data: records,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching finance records:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finance records',
      error: error.message
    })
  }
}

// Get single finance record by ID
export const getFinanceRecordById = async (req, res) => {
  try {
    const { id } = req.params
    
    const record = await FinanceRecord.findById(id)
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      })
    }

    res.json({
      success: true,
      data: record
    })
  } catch (error) {
    console.error('Error fetching finance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finance record',
      error: error.message
    })
  }
}

// Create new finance record
export const createFinanceRecord = async (req, res) => {
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

    const recordData = req.body
    
    // Verify student exists
    const student = await Student.findOne({ studentId: recordData.studentId })
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      })
    }

    const newRecord = new FinanceRecord(recordData)
    await newRecord.save()

    res.status(201).json({
      success: true,
      message: 'Finance record created successfully',
      data: newRecord
    })
  } catch (error) {
    console.error('Error creating finance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create finance record',
      error: error.message
    })
  }
}

// Update finance record
export const updateFinanceRecord = async (req, res) => {
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

    const updatedRecord = await FinanceRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      })
    }

    res.json({
      success: true,
      message: 'Finance record updated successfully',
      data: updatedRecord
    })
  } catch (error) {
    console.error('Error updating finance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update finance record',
      error: error.message
    })
  }
}

// Delete finance record (soft delete)
export const deleteFinanceRecord = async (req, res) => {
  try {
    const { id } = req.params

    const record = await FinanceRecord.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      })
    }

    res.json({
      success: true,
      message: 'Finance record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting finance record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete finance record',
      error: error.message
    })
  }
}

// Get student balance
export const getStudentBalance = async (req, res) => {
  try {
    const { studentId } = req.params

    const balance = await FinanceRecord.getStudentBalance(studentId)

    res.json({
      success: true,
      data: {
        studentId,
        balance,
        formattedBalance: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(balance)
      }
    })
  } catch (error) {
    console.error('Error fetching student balance:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student balance',
      error: error.message
    })
  }
}

// Get finance statistics
export const getFinanceStats = async (req, res) => {
  try {
    const { startDate, endDate, term, session } = req.query

    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.date = {}
      if (startDate) dateFilter.date.$gte = new Date(startDate)
      if (endDate) dateFilter.date.$lte = new Date(endDate)
    }

    let additionalFilter = {}
    if (term) additionalFilter.term = term
    if (session) additionalFilter.session = session

    const filter = { isActive: true, ...dateFilter, ...additionalFilter }

    // Get overall statistics
    const stats = await FinanceRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$type', ['Tuition', 'Fee']] },
                '$amount',
                0
              ]
            }
          },
          totalPayments: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'Payment'] },
                '$amount',
                0
              ]
            }
          },
          totalRefunds: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'Refund'] },
                '$amount',
                0
              ]
            }
          },
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
          }
        }
      }
    ])

    // Get type distribution
    const typeStats = await FinanceRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    // Get status distribution
    const statusStats = await FinanceRecord.aggregate([
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

    // Get monthly trends
    const monthlyTrends = await FinanceRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: {
            $sum: {
              $cond: [
                { $in: ['$type', ['Tuition', 'Fee']] },
                '$amount',
                0
              ]
            }
          },
          payments: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'Payment'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalRevenue: 0,
          totalPayments: 0,
          totalRefunds: 0,
          pendingAmount: 0,
          overdueAmount: 0
        },
        typeDistribution: typeStats,
        statusDistribution: statusStats,
        monthlyTrends
      }
    })
  } catch (error) {
    console.error('Error fetching finance stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch finance statistics',
      error: error.message
    })
  }
}

// Get overdue payments
export const getOverduePayments = async (req, res) => {
  try {
    const overdueRecords = await FinanceRecord.findOverdue()

    res.json({
      success: true,
      data: overdueRecords,
      count: overdueRecords.length
    })
  } catch (error) {
    console.error('Error fetching overdue payments:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue payments',
      error: error.message
    })
  }
}

// Bulk operations
export const bulkUpdateFinanceRecords = async (req, res) => {
  try {
    const { recordIds, updates } = req.body

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Record IDs array is required'
      })
    }

    const result = await FinanceRecord.updateMany(
      { _id: { $in: recordIds } },
      updates
    )

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} finance records`,
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

// Export finance records
export const exportFinanceRecords = async (req, res) => {
  try {
    const { format = 'json', filters } = req.query
    
    let filter = { isActive: true }
    
    if (filters) {
      const parsedFilters = JSON.parse(filters)
      filter = { ...filter, ...parsedFilters }
    }

    const records = await FinanceRecord.find(filter).select('-__v')

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = records.map(record => ({
        'Reference Number': record.referenceNumber,
        'Student ID': record.studentId,
        'Type': record.type,
        'Category': record.category,
        'Amount': record.amount,
        'Date': record.date,
        'Status': record.status,
        'Description': record.description,
        'Term': record.term,
        'Session': record.session
      }))

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=finance_records.csv')
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      res.send(csvString)
    } else {
      res.json({
        success: true,
        data: records,
        count: records.length
      })
    }
  } catch (error) {
    console.error('Error exporting finance records:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export finance records',
      error: error.message
    })
  }
} 