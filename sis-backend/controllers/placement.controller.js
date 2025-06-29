import Placement from '../models/Placement.js'
import Student from '../models/Student.js'
import { validationResult } from 'express-validator'

// Get all placements with filtering and pagination
export const getPlacements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      studentId,
      jobType,
      company,
      startDate,
      endDate,
      verified,
      search,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (status) filter.status = status
    if (studentId) filter.studentId = studentId
    if (jobType) filter.jobType = jobType
    if (verified !== undefined) filter.verified = verified === 'true'
    
    if (startDate || endDate) {
      filter.startDate = {}
      if (startDate) filter.startDate.$gte = new Date(startDate)
      if (endDate) filter.startDate.$lte = new Date(endDate)
    }
    
    if (company) {
      filter['company.name'] = { $regex: company, $options: 'i' }
    }
    
    if (search) {
      filter.$or = [
        { 'company.name': { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { 'employerContact.name': { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Execute query with pagination
    const placements = await Placement.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const total = await Placement.countDocuments(filter)

    res.json({
      success: true,
      data: placements,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching placements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placements',
      error: error.message
    })
  }
}

// Get single placement by ID
export const getPlacementById = async (req, res) => {
  try {
    const { id } = req.params
    
    const placement = await Placement.findById(id)
    
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      })
    }

    res.json({
      success: true,
      data: placement
    })
  } catch (error) {
    console.error('Error fetching placement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement',
      error: error.message
    })
  }
}

// Create new placement
export const createPlacement = async (req, res) => {
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

    const placementData = req.body
    
    // Verify student exists
    const student = await Student.findOne({ studentId: placementData.studentId })
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      })
    }

    const newPlacement = new Placement(placementData)
    await newPlacement.save()

    res.status(201).json({
      success: true,
      message: 'Placement created successfully',
      data: newPlacement
    })
  } catch (error) {
    console.error('Error creating placement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create placement',
      error: error.message
    })
  }
}

// Update placement
export const updatePlacement = async (req, res) => {
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

    const updatedPlacement = await Placement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedPlacement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      })
    }

    res.json({
      success: true,
      message: 'Placement updated successfully',
      data: updatedPlacement
    })
  } catch (error) {
    console.error('Error updating placement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update placement',
      error: error.message
    })
  }
}

// Delete placement (soft delete)
export const deletePlacement = async (req, res) => {
  try {
    const { id } = req.params

    const placement = await Placement.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      })
    }

    res.json({
      success: true,
      message: 'Placement deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting placement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete placement',
      error: error.message
    })
  }
}

// Get employed students
export const getEmployedStudents = async (req, res) => {
  try {
    const employedPlacements = await Placement.findEmployed()

    res.json({
      success: true,
      data: employedPlacements,
      count: employedPlacements.length
    })
  } catch (error) {
    console.error('Error fetching employed students:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employed students',
      error: error.message
    })
  }
}

// Get pending applications
export const getPendingApplications = async (req, res) => {
  try {
    const pendingPlacements = await Placement.findPending()

    res.json({
      success: true,
      data: pendingPlacements,
      count: pendingPlacements.length
    })
  } catch (error) {
    console.error('Error fetching pending applications:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications',
      error: error.message
    })
  }
}

// Verify placement
export const verifyPlacement = async (req, res) => {
  try {
    const { id } = req.params
    const { method, source } = req.body

    const placement = await Placement.findById(id)
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      })
    }

    await placement.verify(method, source)

    res.json({
      success: true,
      message: 'Placement verified successfully',
      data: placement
    })
  } catch (error) {
    console.error('Error verifying placement:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify placement',
      error: error.message
    })
  }
}

// Add interview to placement
export const addInterview = async (req, res) => {
  try {
    const { id } = req.params
    const interviewData = req.body

    const placement = await Placement.findById(id)
    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      })
    }

    await placement.addInterview(interviewData)

    res.json({
      success: true,
      message: 'Interview added successfully',
      data: placement
    })
  } catch (error) {
    console.error('Error adding interview:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add interview',
      error: error.message
    })
  }
}

// Get placement statistics
export const getPlacementStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.startDate = {}
      if (startDate) dateFilter.startDate.$gte = new Date(startDate)
      if (endDate) dateFilter.startDate.$lte = new Date(endDate)
    }

    const filter = { isActive: true, ...dateFilter }

    // Overall statistics
    const stats = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPlacements: { $sum: 1 },
          employedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Employed'] }, 1, 0] }
          },
          seekingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Seeking'] }, 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: ['$verified', 1, 0] }
          }
        }
      }
    ])

    // Status distribution
    const statusStats = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Job type distribution
    const jobTypeStats = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Industry distribution
    const industryStats = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$company.industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Monthly placement trends
    const monthlyTrends = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          placements: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Salary statistics
    const salaryStats = await Placement.aggregate([
      { $match: { ...filter, 'salary.amount': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$salary.amount' },
          minSalary: { $min: '$salary.amount' },
          maxSalary: { $max: '$salary.amount' },
          totalSalary: { $sum: '$salary.amount' }
        }
      }
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalPlacements: 0,
          employedCount: 0,
          seekingCount: 0,
          verifiedCount: 0
        },
        statusDistribution: statusStats,
        jobTypeDistribution: jobTypeStats,
        industryDistribution: industryStats,
        monthlyTrends,
        salaryOverview: salaryStats[0] || {
          avgSalary: 0,
          minSalary: 0,
          maxSalary: 0,
          totalSalary: 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching placement stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement statistics',
      error: error.message
    })
  }
}

// Bulk operations
export const bulkUpdatePlacements = async (req, res) => {
  try {
    const { placementIds, updates } = req.body

    if (!placementIds || !Array.isArray(placementIds) || placementIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Placement IDs array is required'
      })
    }

    const result = await Placement.updateMany(
      { _id: { $in: placementIds } },
      updates
    )

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} placements`,
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

// Export placements
export const exportPlacements = async (req, res) => {
  try {
    const { format = 'json', filters } = req.query
    
    let filter = { isActive: true }
    
    if (filters) {
      const parsedFilters = JSON.parse(filters)
      filter = { ...filter, ...parsedFilters }
    }

    const placements = await Placement.find(filter).select('-__v')

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = placements.map(placement => ({
        'Student ID': placement.studentId,
        'Company': placement.company.name,
        'Job Title': placement.jobTitle,
        'Job Type': placement.jobType,
        'Status': placement.status,
        'Start Date': placement.startDate,
        'Salary': placement.salary.amount,
        'Contact Name': placement.employerContact.name,
        'Contact Email': placement.employerContact.email,
        'Verified': placement.verified
      }))

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=placements.csv')
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      res.send(csvString)
    } else {
      res.json({
        success: true,
        data: placements,
        count: placements.length
      })
    }
  } catch (error) {
    console.error('Error exporting placements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export placements',
      error: error.message
    })
  }
} 