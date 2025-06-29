import express from 'express'
import { body, query, param } from 'express-validator'
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getStudentHistory,
  addHistoryRecord,
  updateHistoryRecord,
  getStudentGPA,
  getFailingGrades,
  getRegistrarStats,
  bulkUpdateCourses,
  exportCourses
} from '../controllers/registrar.controller.js'

const router = express.Router()

// Validation middleware for courses
const validateCourse = [
  body('courseCode')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('credits')
    .isFloat({ min: 0, max: 20 })
    .withMessage('Credits must be between 0 and 20'),
  body('hours.total')
    .isFloat({ min: 0 })
    .withMessage('Total hours must be a positive number'),
  body('hours.lecture')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lecture hours must be a positive number'),
  body('hours.lab')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lab hours must be a positive number'),
  body('hours.clinical')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Clinical hours must be a positive number'),
  body('term')
    .trim()
    .notEmpty()
    .withMessage('Term is required'),
  body('session')
    .trim()
    .notEmpty()
    .withMessage('Session is required'),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('Academic year is required'),
  body('instructor.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Instructor name must be between 2 and 100 characters'),
  body('instructor.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Instructor email must be valid'),
  body('instructor.phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  body('enrollmentLimit')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Enrollment limit must be between 1 and 1000'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Cancelled', 'Completed'])
    .withMessage('Invalid status'),
  body('schedule.days')
    .optional()
    .isArray()
    .withMessage('Schedule days must be an array'),
  body('schedule.days.*')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('schedule.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('schedule.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
]

// Validation middleware for academic history
const validateAcademicHistory = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required'),
  body('courseTitle')
    .trim()
    .notEmpty()
    .withMessage('Course title is required'),
  body('term')
    .trim()
    .notEmpty()
    .withMessage('Term is required'),
  body('session')
    .trim()
    .notEmpty()
    .withMessage('Session is required'),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('Academic year is required'),
  body('grade')
    .isIn(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W', 'P', 'NP'])
    .withMessage('Invalid grade'),
  body('credits')
    .isFloat({ min: 0, max: 20 })
    .withMessage('Credits must be between 0 and 20'),
  body('status')
    .optional()
    .isIn(['Enrolled', 'Completed', 'Withdrawn', 'Incomplete', 'Audit'])
    .withMessage('Invalid status'),
  body('attendance.totalSessions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total sessions must be a positive integer'),
  body('attendance.attendedSessions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Attended sessions must be a positive integer'),
  body('scores.assignments')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Assignment score must be between 0 and 100'),
  body('scores.quizzes')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Quiz score must be between 0 and 100'),
  body('scores.exams')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Exam score must be between 0 and 100'),
  body('scores.participation')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Participation score must be between 0 and 100'),
  body('scores.clinical')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Clinical score must be between 0 and 100'),
  body('scores.final')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Final score must be between 0 and 100')
]

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['title', 'courseCode', 'credits', 'enrollmentCount', 'instructor.name', 'status'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
]

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters')
]

const validateFilters = [
  query('term')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Term filter cannot be empty'),
  query('session')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Session filter cannot be empty'),
  query('instructor')
    .optional()
    .isEmail()
    .withMessage('Instructor must be a valid email'),
  query('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Cancelled', 'Completed'])
    .withMessage('Invalid status filter')
]

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
]

const validateStudentId = [
  param('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
]

const validateBulkUpdate = [
  body('courseIds')
    .isArray({ min: 1 })
    .withMessage('Course IDs must be a non-empty array'),
  body('courseIds.*')
    .isMongoId()
    .withMessage('Invalid course ID in array'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
]

const validateDateRange = [
  query('term')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Term filter cannot be empty'),
  query('session')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Session filter cannot be empty')
]

// Routes

// COURSE MANAGEMENT

// GET /api/registrar/courses - Get all courses with filtering and pagination
router.get('/courses', validatePagination, validateSearch, validateFilters, getCourses)

// GET /api/registrar/courses/stats - Get course statistics
router.get('/courses/stats', validateDateRange, getRegistrarStats)

// GET /api/registrar/courses/export - Export courses
router.get('/courses/export', validateFilters, exportCourses)

// GET /api/registrar/courses/:id - Get single course
router.get('/courses/:id', validateId, getCourseById)

// POST /api/registrar/courses - Create new course
router.post('/courses', validateCourse, createCourse)

// PUT /api/registrar/courses/:id - Update course
router.put('/courses/:id', validateId, validateCourse, updateCourse)

// DELETE /api/registrar/courses/:id - Delete course (soft delete)
router.delete('/courses/:id', validateId, deleteCourse)

// POST /api/registrar/courses/bulk-update - Bulk update courses
router.post('/courses/bulk-update', validateBulkUpdate, bulkUpdateCourses)

// ACADEMIC HISTORY MANAGEMENT

// GET /api/registrar/student-history/:studentId - Get student academic history
router.get('/student-history/:studentId', validateStudentId, getStudentHistory)

// GET /api/registrar/student/:studentId/gpa - Get student GPA
router.get('/student/:studentId/gpa', validateStudentId, getStudentGPA)

// GET /api/registrar/failing-grades - Get failing grades
router.get('/failing-grades', getFailingGrades)

// POST /api/registrar/student-history - Add academic history record
router.post('/student-history', validateAcademicHistory, addHistoryRecord)

// PUT /api/registrar/student-history/:id - Update academic history record
router.put('/student-history/:id', validateId, validateAcademicHistory, updateHistoryRecord)

export default router 