import Student from '../models/Student.js'
import FinanceRecord from '../models/FinanceRecord.js'
import AcademicHistory from '../models/AcademicHistory.js'
import Placement from '../models/Placement.js'
import Course from '../models/Course.js'
import { validationResult } from 'express-validator'
import PDFDocument from 'pdfkit'
import { Parser } from 'json2csv'

// Admissions Summary Report
export const admissionsSummary = async (req, res) => {
  try {
    const { startDate, endDate, campus, program, term, session } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }
    
    if (campus) filter.campus = campus
    if (program) filter.program = program
    if (term) filter.term = term
    if (session) filter.session = session

    // Status distribution
    const statusCounts = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Program distribution
    const programCounts = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Campus distribution
    const campusCounts = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$campus',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Lead source analysis
    const leadSourceCounts = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$leadSource',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Monthly enrollment trends
    const monthlyTrends = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Total counts
    const totalStudents = await Student.countDocuments(filter)
    const enrolledStudents = await Student.countDocuments({ ...filter, status: 'Enrolled' })
    const prospectiveStudents = await Student.countDocuments({ ...filter, status: 'Prospective' })

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          enrolledStudents,
          prospectiveStudents,
          enrollmentRate: totalStudents > 0 ? Math.round((enrolledStudents / totalStudents) * 100) : 0
        },
        statusDistribution: statusCounts,
        programDistribution: programCounts,
        campusDistribution: campusCounts,
        leadSourceAnalysis: leadSourceCounts,
        monthlyTrends
      }
    })
  } catch (error) {
    console.error('Error generating admissions summary:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate admissions summary',
      error: error.message
    })
  }
}

// Finance Statistics Report
export const financeStats = async (req, res) => {
  try {
    const { startDate, endDate, term, session, campus } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    
    if (term) filter.term = term
    if (session) filter.session = session

    // Overall financial summary
    const financialSummary = await FinanceRecord.aggregate([
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

    // Transaction type breakdown
    const typeBreakdown = await FinanceRecord.aggregate([
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

    // Status breakdown
    const statusBreakdown = await FinanceRecord.aggregate([
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

    // Monthly revenue trends
    const monthlyRevenue = await FinanceRecord.aggregate([
      { $match: { ...filter, type: { $in: ['Tuition', 'Fee'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Payment method analysis
    const paymentMethods = await FinanceRecord.aggregate([
      { $match: { ...filter, type: 'Payment' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    res.json({
      success: true,
      data: {
        summary: financialSummary[0] || {
          totalRevenue: 0,
          totalPayments: 0,
          totalRefunds: 0,
          pendingAmount: 0,
          overdueAmount: 0
        },
        typeBreakdown,
        statusBreakdown,
        monthlyRevenue,
        paymentMethods
      }
    })
  } catch (error) {
    console.error('Error generating finance stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate finance statistics',
      error: error.message
    })
  }
}

// Registrar Breakdown Report
export const registrarBreakdown = async (req, res) => {
  try {
    const { startDate, endDate, term, session, campus } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }
    
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

    // Grade distribution
    const gradeDistribution = await AcademicHistory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Program performance
    const programPerformance = await AcademicHistory.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: 'studentId',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.program',
          totalStudents: { $addToSet: '$studentId' },
          avgGPA: { $avg: '$gradePoints' },
          totalCredits: { $sum: '$credits' }
        }
      },
      {
        $project: {
          program: '$_id',
          studentCount: { $size: '$totalStudents' },
          avgGPA: { $round: ['$avgGPA', 2] },
          totalCredits: 1
        }
      },
      { $sort: { avgGPA: -1 } }
    ])

    // Instructor workload
    const instructorWorkload = await Course.aggregate([
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

    // Term completion rates
    const termCompletion = await AcademicHistory.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            term: '$term',
            session: '$session'
          },
          totalEnrollments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          term: '$_id.term',
          session: '$_id.session',
          totalEnrollments: 1,
          completed: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completed', '$totalEnrollments'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { term: 1, session: 1 } }
    ])

    res.json({
      success: true,
      data: {
        courseOverview: courseStats[0] || {
          totalCourses: 0,
          activeCourses: 0,
          totalEnrollment: 0
        },
        gradeDistribution,
        programPerformance,
        instructorWorkload,
        termCompletion
      }
    })
  } catch (error) {
    console.error('Error generating registrar breakdown:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate registrar breakdown',
      error: error.message
    })
  }
}

// Placement Outcomes Report
export const placementOutcomes = async (req, res) => {
  try {
    const { startDate, endDate, campus, program } = req.query

    // Build filter object
    let filter = { isActive: true }
    
    if (startDate || endDate) {
      filter.startDate = {}
      if (startDate) filter.startDate.$gte = new Date(startDate)
      if (endDate) filter.startDate.$lte = new Date(endDate)
    }

    // Status distribution
    const statusDistribution = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Industry breakdown
    const industryBreakdown = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$company.industry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Job type analysis
    const jobTypeAnalysis = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
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

    // Verification status
    const verificationStatus = await Placement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$verified',
          count: { $sum: 1 }
        }
      }
    ])

    // Overall placement metrics
    const totalPlacements = await Placement.countDocuments(filter)
    const employedCount = await Placement.countDocuments({ ...filter, status: 'Employed' })
    const verifiedCount = await Placement.countDocuments({ ...filter, verified: true })

    res.json({
      success: true,
      data: {
        overview: {
          totalPlacements,
          employedCount,
          verifiedCount,
          employmentRate: totalPlacements > 0 ? Math.round((employedCount / totalPlacements) * 100) : 0,
          verificationRate: totalPlacements > 0 ? Math.round((verifiedCount / totalPlacements) * 100) : 0
        },
        statusDistribution,
        industryBreakdown,
        jobTypeAnalysis,
        salaryOverview: salaryStats[0] || {
          avgSalary: 0,
          minSalary: 0,
          maxSalary: 0,
          totalSalary: 0
        },
        monthlyTrends,
        verificationStatus
      }
    })
  } catch (error) {
    console.error('Error generating placement outcomes:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate placement outcomes',
      error: error.message
    })
  }
}

// Export Report
export const exportReport = async (req, res) => {
  try {
    const { type } = req.params
    const { format = 'csv', filters } = req.query

    let data = []
    let filename = ''

    // Get data based on report type
    switch (type) {
      case 'admissions':
        data = await getAdmissionsData(filters)
        filename = 'admissions_report'
        break
      case 'finance':
        data = await getFinanceData(filters)
        filename = 'finance_report'
        break
      case 'registrar':
        data = await getRegistrarData(filters)
        filename = 'registrar_report'
        break
      case 'placement':
        data = await getPlacementData(filters)
        filename = 'placement_report'
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        })
    }

    // Export based on format
    switch (format) {
      case 'csv':
        const parser = new Parser()
        const csv = parser.parse(data)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`)
        res.send(csv)
        break
      case 'pdf':
        const doc = new PDFDocument()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`)
        doc.pipe(res)
        
        // Add content to PDF
        doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' })
        doc.moveDown()
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`)
        doc.moveDown()
        
        // Add data to PDF (simplified)
        data.forEach((item, index) => {
          doc.text(`${index + 1}. ${JSON.stringify(item)}`)
          doc.moveDown(0.5)
        })
        
        doc.end()
        break
      case 'excel':
        // For Excel, we'll return JSON and let frontend handle conversion
        res.json({
          success: true,
          data,
          filename: `${filename}.xlsx`
        })
        break
      default:
        res.json({
          success: true,
          data
        })
    }
  } catch (error) {
    console.error('Error exporting report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    })
  }
}

// Helper functions for export
const getAdmissionsData = async (filters) => {
  const parsedFilters = filters ? JSON.parse(filters) : {}
  const students = await Student.find({ isActive: true, ...parsedFilters })
  return students.map(student => ({
    'Student ID': student.studentId,
    'Name': student.name,
    'Email': student.email,
    'Campus': student.campus,
    'Program': student.program,
    'Status': student.status,
    'First Term': student.firstTerm,
    'Lead Source': student.leadSource,
    'Created Date': student.createdAt
  }))
}

const getFinanceData = async (filters) => {
  const parsedFilters = filters ? JSON.parse(filters) : {}
  const records = await FinanceRecord.find({ isActive: true, ...parsedFilters })
  return records.map(record => ({
    'Reference Number': record.referenceNumber,
    'Student ID': record.studentId,
    'Type': record.type,
    'Amount': record.amount,
    'Date': record.date,
    'Status': record.status,
    'Description': record.description
  }))
}

const getRegistrarData = async (filters) => {
  const parsedFilters = filters ? JSON.parse(filters) : {}
  const history = await AcademicHistory.find({ isActive: true, ...parsedFilters })
  return history.map(record => ({
    'Student ID': record.studentId,
    'Course Code': record.courseCode,
    'Grade': record.grade,
    'Credits': record.credits,
    'Term': record.term,
    'Status': record.status
  }))
}

const getPlacementData = async (filters) => {
  const parsedFilters = filters ? JSON.parse(filters) : {}
  const placements = await Placement.find({ isActive: true, ...parsedFilters })
  return placements.map(placement => ({
    'Student ID': placement.studentId,
    'Company': placement.company.name,
    'Job Title': placement.jobTitle,
    'Status': placement.status,
    'Start Date': placement.startDate,
    'Salary': placement.salary.amount,
    'Verified': placement.verified
  }))
}

// Get Report Templates
export const getReportTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'admissions_summary',
        name: 'Admissions Summary',
        description: 'Overview of student enrollment and demographics',
        module: 'admissions',
        defaultFilters: {},
        metrics: ['totalStudents', 'enrollmentRate', 'programDistribution']
      },
      {
        id: 'finance_overview',
        name: 'Finance Overview',
        description: 'Financial performance and transaction analysis',
        module: 'finance',
        defaultFilters: {},
        metrics: ['totalRevenue', 'totalPayments', 'pendingAmount']
      },
      {
        id: 'academic_performance',
        name: 'Academic Performance',
        description: 'Student grades and program performance',
        module: 'registrar',
        defaultFilters: {},
        metrics: ['avgGPA', 'completionRate', 'gradeDistribution']
      },
      {
        id: 'placement_outcomes',
        name: 'Placement Outcomes',
        description: 'Job placement and employment statistics',
        module: 'placement',
        defaultFilters: {},
        metrics: ['employmentRate', 'avgSalary', 'industryBreakdown']
      }
    ]

    res.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching report templates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report templates',
      error: error.message
    })
  }
}

// Generate Custom Report
export const generateCustomReport = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, description, module, filters, groupBy, metrics, schedule } = req.body

    // This would typically save the report configuration to a database
    // For now, we'll just return a success response
    const reportConfig = {
      id: Date.now().toString(),
      name,
      description,
      module,
      filters,
      groupBy,
      metrics,
      schedule,
      createdBy: req.user?.id || 'system',
      createdAt: new Date()
    }

    res.status(201).json({
      success: true,
      message: 'Custom report created successfully',
      data: reportConfig
    })
  } catch (error) {
    console.error('Error creating custom report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create custom report',
      error: error.message
    })
  }
}

// Schedule Report
export const scheduleReport = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { frequency, recipients, format, reportType, filters } = req.body

    // This would typically save the schedule to a database and set up cron jobs
    // For now, we'll just return a success response
    const schedule = {
      id: Date.now().toString(),
      frequency,
      recipients,
      format,
      reportType,
      filters,
      createdBy: req.user?.id || 'system',
      createdAt: new Date(),
      nextRun: calculateNextRun(frequency)
    }

    res.status(201).json({
      success: true,
      message: 'Report scheduled successfully',
      data: schedule
    })
  } catch (error) {
    console.error('Error scheduling report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to schedule report',
      error: error.message
    })
  }
}

// Helper function to calculate next run time
const calculateNextRun = (frequency) => {
  const now = new Date()
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
    default:
      return now
  }
} 