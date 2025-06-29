import express from 'express'
import { body, query, param } from 'express-validator'
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  bulkUpdateStudents,
  exportStudents
} from '../controllers/admissions.controller.js'

const router = express.Router()

// Validation middleware
const validateStudent = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('campus')
    .trim()
    .notEmpty()
    .withMessage('Campus is required'),
  body('program')
    .trim()
    .notEmpty()
    .withMessage('Program is required'),
  body('session')
    .trim()
    .notEmpty()
    .withMessage('Session is required'),
  body('firstTerm')
    .isISO8601()
    .withMessage('First term must be a valid date'),
  body('status')
    .optional()
    .isIn(['Prospective', 'Enrolled', 'Active', 'Graduated', 'Withdrawn', 'Suspended'])
    .withMessage('Invalid status'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender'),
  body('leadSource')
    .optional()
    .isIn(['Website', 'Social Media', 'Referral', 'Advertisement', 'Career Fair', 'Other'])
    .withMessage('Invalid lead source'),
  body('fundingSource')
    .optional()
    .isIn(['Self-Pay', 'Federal Aid', 'Private Loan', 'Scholarship', 'Employer', 'Other'])
    .withMessage('Invalid funding source')
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
    .isIn(['name', 'studentId', 'email', 'campus', 'program', 'status', 'firstTerm', 'createdAt'])
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
  query('status')
    .optional()
    .isIn(['Prospective', 'Enrolled', 'Active', 'Graduated', 'Withdrawn', 'Suspended'])
    .withMessage('Invalid status filter'),
  query('program')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Program filter cannot be empty'),
  query('campus')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Campus filter cannot be empty'),
  query('session')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Session filter cannot be empty')
]

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID format')
]

const validateBulkUpdate = [
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('Student IDs must be a non-empty array'),
  body('studentIds.*')
    .isMongoId()
    .withMessage('Invalid student ID in array'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
]

// Routes

// GET /api/admissions - Get all students with filtering and pagination
router.get('/', validatePagination, validateSearch, validateFilters, getAllStudents)

// GET /api/admissions/stats - Get student statistics
router.get('/stats', getStudentStats)

// GET /api/admissions/export - Export students data
router.get('/export', validateFilters, exportStudents)

// GET /api/admissions/:id - Get single student
router.get('/:id', validateId, getStudentById)

// POST /api/admissions - Create new student
router.post('/', validateStudent, createStudent)

// PUT /api/admissions/:id - Update student
router.put('/:id', validateId, validateStudent, updateStudent)

// DELETE /api/admissions/:id - Delete student (soft delete)
router.delete('/:id', validateId, deleteStudent)

// POST /api/admissions/bulk-update - Bulk update students
router.post('/bulk-update', validateBulkUpdate, bulkUpdateStudents)

export default router 