import express from 'express'
import { body, query, param } from 'express-validator'
import {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getEmployedStudents,
  getPendingApplications,
  verifyPlacement,
  addInterview,
  getPlacementStats,
  bulkUpdatePlacements,
  exportPlacements
} from '../controllers/placement.controller.js'

const router = express.Router()

// Validation middleware
const validatePlacement = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('company.name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  body('company.industry')
    .optional()
    .isIn(['Healthcare', 'Wellness', 'Spa', 'Fitness', 'Rehabilitation', 'Education', 'Other'])
    .withMessage('Invalid industry'),
  body('company.size')
    .optional()
    .isIn(['Small (1-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'])
    .withMessage('Invalid company size'),
  body('company.website')
    .optional()
    .isURL()
    .withMessage('Invalid website URL'),
  body('jobTitle')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  body('jobType')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance'])
    .withMessage('Invalid job type'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('hoursPerWeek')
    .optional()
    .isFloat({ min: 0, max: 168 })
    .withMessage('Hours per week must be between 0 and 168'),
  body('salary.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary amount must be a positive number'),
  body('salary.type')
    .optional()
    .isIn(['Hourly', 'Salary', 'Commission', 'Other'])
    .withMessage('Invalid salary type'),
  body('salary.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('benefits.*')
    .optional()
    .isIn(['Health Insurance', 'Dental Insurance', 'Vision Insurance', '401k', 'PTO', 'Flexible Schedule', 'Other'])
    .withMessage('Invalid benefit type'),
  body('status')
    .optional()
    .isIn(['Applied', 'Interviewing', 'Offered', 'Employed', 'Rejected', 'Withdrawn', 'Not Seeking'])
    .withMessage('Invalid status'),
  body('employerContact.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('employerContact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Contact email must be valid'),
  body('employerContact.phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  body('applicationMethod')
    .optional()
    .isIn(['Online', 'In-Person', 'Referral', 'Career Fair', 'Networking', 'Other'])
    .withMessage('Invalid application method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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
    .isIn(['startDate', 'applicationDate', 'company.name', 'jobTitle', 'status'])
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
    .isIn(['Applied', 'Interviewing', 'Offered', 'Employed', 'Rejected', 'Withdrawn', 'Not Seeking'])
    .withMessage('Invalid status filter'),
  query('studentId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student ID filter cannot be empty'),
  query('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance'])
    .withMessage('Invalid job type filter'),
  query('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company filter cannot be empty'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be a boolean')
]

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid placement ID format')
]

const validateBulkUpdate = [
  body('placementIds')
    .isArray({ min: 1 })
    .withMessage('Placement IDs must be a non-empty array'),
  body('placementIds.*')
    .isMongoId()
    .withMessage('Invalid placement ID in array'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
]

const validateVerification = [
  body('method')
    .isIn(['Email', 'Phone', 'Document', 'In-Person', 'Other'])
    .withMessage('Invalid verification method'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Verification source is required')
]

const validateInterview = [
  body('date')
    .isISO8601()
    .withMessage('Interview date must be a valid date'),
  body('type')
    .isIn(['Phone', 'Video', 'In-Person', 'Panel', 'Technical', 'Other'])
    .withMessage('Invalid interview type'),
  body('interviewer')
    .trim()
    .notEmpty()
    .withMessage('Interviewer is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Interview notes cannot exceed 500 characters'),
  body('outcome')
    .optional()
    .isIn(['Passed', 'Failed', 'Pending', 'Cancelled'])
    .withMessage('Invalid interview outcome')
]

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
]

// Routes

// GET /api/placement - Get all placements with filtering and pagination
router.get('/', validatePagination, validateSearch, validateFilters, getPlacements)

// GET /api/placement/stats - Get placement statistics
router.get('/stats', validateDateRange, getPlacementStats)

// GET /api/placement/employed - Get employed students
router.get('/employed', getEmployedStudents)

// GET /api/placement/pending - Get pending applications
router.get('/pending', getPendingApplications)

// GET /api/placement/export - Export placements
router.get('/export', validateFilters, exportPlacements)

// GET /api/placement/:id - Get single placement
router.get('/:id', validateId, getPlacementById)

// POST /api/placement - Create new placement
router.post('/', validatePlacement, createPlacement)

// PUT /api/placement/:id - Update placement
router.put('/:id', validateId, validatePlacement, updatePlacement)

// DELETE /api/placement/:id - Delete placement (soft delete)
router.delete('/:id', validateId, deletePlacement)

// POST /api/placement/:id/verify - Verify placement
router.post('/:id/verify', validateId, validateVerification, verifyPlacement)

// POST /api/placement/:id/interview - Add interview to placement
router.post('/:id/interview', validateId, validateInterview, addInterview)

// POST /api/placement/bulk-update - Bulk update placements
router.post('/bulk-update', validateBulkUpdate, bulkUpdatePlacements)

export default router 