import express from 'express'
import { body, query, param } from 'express-validator'
import {
  getFinanceRecords,
  getFinanceRecordById,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  getStudentBalance,
  getFinanceStats,
  getOverduePayments,
  bulkUpdateFinanceRecords,
  exportFinanceRecords
} from '../controllers/finance.controller.js'

const router = express.Router()

// Validation middleware
const validateFinanceRecord = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('type')
    .isIn(['Tuition', 'Payment', 'Fee', 'Refund', 'Scholarship', 'Loan', 'Credit', 'Debit'])
    .withMessage('Invalid transaction type'),
  body('category')
    .optional()
    .isIn(['Tuition', 'Books', 'Supplies', 'Lab Fees', 'Late Fees', 'Other'])
    .withMessage('Invalid category'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('term')
    .trim()
    .notEmpty()
    .withMessage('Term is required'),
  body('session')
    .trim()
    .notEmpty()
    .withMessage('Session is required'),
  body('status')
    .optional()
    .isIn(['Pending', 'Paid', 'Overdue', 'Cancelled', 'Refunded', 'Disputed'])
    .withMessage('Invalid status'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Check', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Payment', 'Other'])
    .withMessage('Invalid payment method'),
  body('fundingSource')
    .optional()
    .isIn(['Self-Pay', 'Federal Aid', 'Private Loan', 'Scholarship', 'Employer', 'Other'])
    .withMessage('Invalid funding source'),
  body('loanType')
    .optional()
    .isIn(['Direct Subsidized', 'Direct Unsubsidized', 'Direct PLUS', 'Private', 'Other'])
    .withMessage('Invalid loan type'),
  body('description')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Description must be between 3 and 500 characters'),
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
    .isIn(['date', 'amount', 'type', 'status', 'studentId', 'referenceNumber'])
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
  query('studentId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student ID filter cannot be empty'),
  query('type')
    .optional()
    .isIn(['Tuition', 'Payment', 'Fee', 'Refund', 'Scholarship', 'Loan', 'Credit', 'Debit'])
    .withMessage('Invalid type filter'),
  query('status')
    .optional()
    .isIn(['Pending', 'Paid', 'Overdue', 'Cancelled', 'Refunded', 'Disputed'])
    .withMessage('Invalid status filter'),
  query('category')
    .optional()
    .isIn(['Tuition', 'Books', 'Supplies', 'Lab Fees', 'Late Fees', 'Other'])
    .withMessage('Invalid category filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number')
]

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid finance record ID format')
]

const validateStudentId = [
  param('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
]

const validateBulkUpdate = [
  body('recordIds')
    .isArray({ min: 1 })
    .withMessage('Record IDs must be a non-empty array'),
  body('recordIds.*')
    .isMongoId()
    .withMessage('Invalid record ID in array'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
]

const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
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

// GET /api/finance - Get all finance records with filtering and pagination
router.get('/', validatePagination, validateSearch, validateFilters, getFinanceRecords)

// GET /api/finance/stats - Get finance statistics
router.get('/stats', validateDateRange, getFinanceStats)

// GET /api/finance/overdue - Get overdue payments
router.get('/overdue', getOverduePayments)

// GET /api/finance/export - Export finance records
router.get('/export', validateFilters, exportFinanceRecords)

// GET /api/finance/:id - Get single finance record
router.get('/:id', validateId, getFinanceRecordById)

// GET /api/finance/student/:studentId/balance - Get student balance
router.get('/student/:studentId/balance', validateStudentId, getStudentBalance)

// POST /api/finance - Create new finance record
router.post('/', validateFinanceRecord, createFinanceRecord)

// PUT /api/finance/:id - Update finance record
router.put('/:id', validateId, validateFinanceRecord, updateFinanceRecord)

// DELETE /api/finance/:id - Delete finance record (soft delete)
router.delete('/:id', validateId, deleteFinanceRecord)

// POST /api/finance/bulk-update - Bulk update finance records
router.post('/bulk-update', validateBulkUpdate, bulkUpdateFinanceRecords)

export default router 