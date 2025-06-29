import Student from '../models/Student.js'
import { validationResult } from 'express-validator'

// Get all students with filtering and pagination
export const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      program,
      campus,
      session,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (status) filter.status = status
    if (program) filter.program = program
    if (campus) filter.campus = campus
    if (session) filter.session = session
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Execute query with pagination
    const students = await Student.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const total = await Student.countDocuments(filter)

    res.json({
      success: true,
      data: students,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    })
  }
}

// Get single student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params
    
    const student = await Student.findById(id)
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    res.json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error('Error fetching student:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message
    })
  }
}

// Create new student
export const createStudent = async (req, res) => {
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

    const studentData = req.body
    
    // Check if student with same email or studentId already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: studentData.email },
        { studentId: studentData.studentId }
      ]
    })

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or student ID already exists'
      })
    }

    const newStudent = new Student(studentData)
    await newStudent.save()

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent
    })
  } catch (error) {
    console.error('Error creating student:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    })
  }
}

// Update student
export const updateStudent = async (req, res) => {
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

    // Check if email is being updated and if it's already taken
    if (updateData.email) {
      const existingStudent = await Student.findOne({
        email: updateData.email,
        _id: { $ne: id }
      })

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another student'
        })
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    })
  } catch (error) {
    console.error('Error updating student:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    })
  }
}

// Delete student (soft delete)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params

    const student = await Student.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    })
  }
}

// Get student statistics
export const getStudentStats = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          enrolledStudents: {
            $sum: {
              $cond: [{ $in: ['$status', ['Enrolled', 'Active']] }, 1, 0]
            }
          },
          prospectiveStudents: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Prospective'] }, 1, 0]
            }
          },
          graduatedStudents: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Graduated'] }, 1, 0]
            }
          }
        }
      }
    ])

    // Get program distribution
    const programStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Get campus distribution
    const campusStats = await Student.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$campus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalStudents: 0,
          enrolledStudents: 0,
          prospectiveStudents: 0,
          graduatedStudents: 0
        },
        programDistribution: programStats,
        campusDistribution: campusStats
      }
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student statistics',
      error: error.message
    })
  }
}

// Bulk operations
export const bulkUpdateStudents = async (req, res) => {
  try {
    const { studentIds, updates } = req.body

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      })
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      updates
    )

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} students`,
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

// Export students data
export const exportStudents = async (req, res) => {
  try {
    const { format = 'json', filters } = req.query
    
    let filter = { isActive: true }
    
    if (filters) {
      const parsedFilters = JSON.parse(filters)
      filter = { ...filter, ...parsedFilters }
    }

    const students = await Student.find(filter).select('-__v')

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = students.map(student => ({
        'Student ID': student.studentId,
        'Name': student.name,
        'Email': student.email,
        'Phone': student.phone,
        'Campus': student.campus,
        'Program': student.program,
        'Status': student.status,
        'First Term': student.firstTerm,
        'Lead Source': student.leadSource
      }))

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv')
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      res.send(csvString)
    } else {
      res.json({
        success: true,
        data: students,
        count: students.length
      })
    }
  } catch (error) {
    console.error('Error exporting students:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export students',
      error: error.message
    })
  }
} 