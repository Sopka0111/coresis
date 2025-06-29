import Course from '../models/Course.js'
import AcademicHistory from '../models/AcademicHistory.js'
import Student from '../models/Student.js'
import { validationResult } from 'express-validator'

// COURSE MANAGEMENT

// Get all courses with filtering and pagination
export const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      term,
      session,
      instructor,
      status,
      search,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (term) filter.term = term
    if (session) filter.session = session
    if (instructor) filter['instructor.email'] = instructor
    if (status) filter.status = status
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Execute query with pagination
    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')

    // Get total count for pagination
    const total = await Course.countDocuments(filter)

    res.json({
      success: true,
      data: courses,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    })
  }
}

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params
    
    const course = await Course.findById(id)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    res.json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    })
  }
}

// Create new course
export const createCourse = async (req, res) => {
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

    const courseData = req.body
    
    // Check if course with same code already exists
    const existingCourse = await Course.findOne({ courseCode: courseData.courseCode })
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this code already exists'
      })
    }

    const newCourse = new Course(courseData)
    await newCourse.save()

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    })
  } catch (error) {
    console.error('Error creating course:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    })
  }
}

// Update course
export const updateCourse = async (req, res) => {
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

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    })
  } catch (error) {
    console.error('Error updating course:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    })
  }
}

// Delete course (soft delete)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params

    const course = await Course.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    })
  }
}

// ACADEMIC HISTORY MANAGEMENT

// Get student academic history
export const getStudentHistory = async (req, res) => {
  try {
    const { studentId } = req.params
    const { term, session, status } = req.query

    // Build filter object
    let filter = { studentId, isActive: true }
    
    if (term) filter.term = term
    if (session) filter.session = session
    if (status) filter.status = status

    const history = await AcademicHistory.find(filter)
      .sort({ term: -1, session: -1 })
      .select('-__v')

    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('Error fetching student history:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student history',
      error: error.message
    })
  }
}

// Add academic history record
export const addHistoryRecord = async (req, res) => {
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

    const historyData = req.body
    
    // Verify student exists
    const student = await Student.findOne({ studentId: historyData.studentId })
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      })
    }

    // Verify course exists
    const course = await Course.findOne({ courseCode: historyData.courseCode })
    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Course not found'
      })
    }

    const newRecord = new AcademicHistory(historyData)
    await newRecord.save()

    res.status(201).json({
      success: true,
      message: 'Academic history record created successfully',
      data: newRecord
    })
  } catch (error) {
    console.error('Error creating academic history record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create academic history record',
      error: error.message
    })
  }
}

// Update academic history record
export const updateHistoryRecord = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedRecord = await AcademicHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Academic history record not found'
      })
    }

    res.json({
      success: true,
      message: 'Academic history record updated successfully',
      data: updatedRecord
    })
  } catch (error) {
    console.error('Error updating academic history record:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update academic history record',
      error: error.message
    })
  }
}

// Get student GPA
export const getStudentGPA = async (req, res) => {
  try {
    const { studentId } = req.params

    const gpa = await AcademicHistory.calculateGPA(studentId)

    res.json({
      success: true,
      data: {
        studentId,
        gpa: parseFloat(gpa.toFixed(2))
      }
    })
  } catch (error) {
    console.error('Error calculating student GPA:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to calculate student GPA',
      error: error.message
    })
  }
}

// Get failing grades
export const getFailingGrades = async (req, res) => {
  try {
    const failingGrades = await AcademicHistory.findFailingGrades()

    res.json({
      success: true,
      data: failingGrades,
      count: failingGrades.length
    })
  } catch (error) {
    console.error('Error fetching failing grades:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch failing grades',
      error: error.message
    })
  }
}

// Get registrar statistics
export const getRegistrarStats = async (req, res) => {
  try {
    const { term, session } = req.query

    let filter = { isActive: true }
    if (term) filter.term = term
    if (session) filter.session = session

    // Course statistics
    const courseStats = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          totalEnrollment: { $sum: '$enrollmentCount' }
        }
      }
    ])

    // Program distribution
    const programStats = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$program',
          courseCount: { $sum: 1 },
          totalEnrollment: { $sum: '$enrollmentCount' }
        }
      },
      { $sort: { courseCount: -1 } }
    ])

    // Instructor workload
    const instructorStats = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$instructor.name',
          courseCount: { $sum: 1 },
          totalEnrollment: { $sum: '$enrollmentCount' }
        }
      },
      { $sort: { courseCount: -1 } }
    ])

    // Academic performance
    const performanceStats = await AcademicHistory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({
      success: true,
      data: {
        courseOverview: courseStats[0] || {
          totalCourses: 0,
          activeCourses: 0,
          totalEnrollment: 0
        },
        programDistribution: programStats,
        instructorWorkload: instructorStats,
        gradeDistribution: performanceStats
      }
    })
  } catch (error) {
    console.error('Error fetching registrar stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrar statistics',
      error: error.message
    })
  }
}

// Bulk operations
export const bulkUpdateCourses = async (req, res) => {
  try {
    const { courseIds, updates } = req.body

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs array is required'
      })
    }

    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
      updates
    )

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} courses`,
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

// Export courses
export const exportCourses = async (req, res) => {
  try {
    const { format = 'json', filters } = req.query
    
    let filter = { isActive: true }
    
    if (filters) {
      const parsedFilters = JSON.parse(filters)
      filter = { ...filter, ...parsedFilters }
    }

    const courses = await Course.find(filter).select('-__v')

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = courses.map(course => ({
        'Course Code': course.courseCode,
        'Title': course.title,
        'Credits': course.credits,
        'Term': course.term,
        'Session': course.session,
        'Instructor': course.instructor.name,
        'Enrollment Limit': course.enrollmentLimit,
        'Enrolled': course.enrollmentCount,
        'Status': course.status
      }))

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=courses.csv')
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      res.send(csvString)
    } else {
      res.json({
        success: true,
        data: courses,
        count: courses.length
      })
    }
  } catch (error) {
    console.error('Error exporting courses:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export courses',
      error: error.message
    })
  }
} 