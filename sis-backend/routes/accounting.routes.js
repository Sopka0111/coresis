import express from 'express'
import { body, query, param } from 'express-validator'
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  reconcileTransaction,
  disputeTransaction,
  getPendingTransactions,
  getOverdueTransactions,
  getUnreconciledTransactions,
  getAccountBalance,
  getAccountingStats,
  bulkUpdateTransactions,
  exportTransactions
} from '../controllers/accounting.controller.js'

const router = express.Router()

// Validation middleware
const validateTransaction = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('txnType')
    .isIn(['Tuition', 'Payment', 'Refund', 'Fee', 'Scholarship', 'Loan', 'Credit', 'Debit', 'Adjustment'])
    .withMessage('Invalid transaction type'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('method')
    .isIn(['Cash', 'Check', 'Credit Card', 'Debit Card', 'ACH', 'Wire Transfer', 'Loan', 'Scholarship', 'Other'])
    .withMessage('Invalid payment method'),
  body('ledgerCode')
    .trim()
    .notEmpty()
    .withMessage('Ledger code is required'),
  body('accountCategory')
    .isIn(['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'])
    .withMessage('Invalid account category'),
  body('description')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Description must be between 3 and 500 characters'),
  body('transactionDate')
    .optional()
    .isISO8601()
    .withMessage('Transaction date must be a valid date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('term')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Term cannot be empty'),
  body('session')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Session cannot be empty'),
  body('academicYear')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Academic year cannot be empty'),
  body('paymentReference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Payment reference cannot exceed 100 characters'),
  body('checkNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Check number cannot exceed 50 characters'),
  body('cardLastFour')
    .optional()
    .trim()
    .isLength({ min: 4, max: 4 })
    .withMessage('Card last four must be exactly 4 digits'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('internalNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Internal notes cannot exceed 1000 characters')
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
    .isIn(['transactionDate', 'amount', 'txnType', 'status', 'studentId', 'referenceNumber'])
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
  query('txnType')
    .optional()
    .isIn(['Tuition', 'Payment', 'Refund', 'Fee', 'Scholarship', 'Loan', 'Credit', 'Debit', 'Adjustment'])
    .withMessage('Invalid transaction type filter'),
  query('status')
    .optional()
    .isIn(['Settled', 'Pending', 'Overdue', 'Cancelled', 'Disputed', 'Reconciled'])
    .withMessage('Invalid status filter'),
  query('ledgerCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ledger code filter cannot be empty'),
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
    .withMessage('Maximum amount must be a positive number'),
  query('reconciled')
    .optional()
    .isBoolean()
    .withMessage('Reconciled must be a boolean'),
  query('approved')
    .optional()
    .isBoolean()
    .withMessage('Approved must be a boolean')
]

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID format')
]

const validateLedgerCode = [
  param('ledgerCode')
    .trim()
    .notEmpty()
    .withMessage('Ledger code is required')
]

const validateBulkUpdate = [
  body('transactionIds')
    .isArray({ min: 1 })
    .withMessage('Transaction IDs must be a non-empty array'),
  body('transactionIds.*')
    .isMongoId()
    .withMessage('Invalid transaction ID in array'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
]

const validateApproval = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Approval notes cannot exceed 500 characters')
]

const validateDispute = [
  body('reason')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Dispute reason must be between 3 and 500 characters')
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
  query('ledgerCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Ledger code filter cannot be empty')
]

// Routes

// GET /api/accounting - Get all transactions with filtering and pagination
router.get('/', validatePagination, validateSearch, validateFilters, getTransactions)

// GET /api/accounting/stats - Get accounting statistics
router.get('/stats', validateDateRange, getAccountingStats)

// GET /api/accounting/pending - Get pending transactions
router.get('/pending', getPendingTransactions)

// GET /api/accounting/overdue - Get overdue transactions
router.get('/overdue', getOverdueTransactions)

// GET /api/accounting/unreconciled - Get unreconciled transactions
router.get('/unreconciled', getUnreconciledTransactions)

// GET /api/accounting/export - Export transactions
router.get('/export', validateFilters, exportTransactions)

// GET /api/accounting/:id - Get single transaction
router.get('/:id', validateId, getTransactionById)

// GET /api/accounting/balance/:ledgerCode - Get account balance
router.get('/balance/:ledgerCode', validateLedgerCode, getAccountBalance)

// POST /api/accounting - Create new transaction
router.post('/', validateTransaction, createTransaction)

// PUT /api/accounting/:id - Update transaction
router.put('/:id', validateId, validateTransaction, updateTransaction)

// DELETE /api/accounting/:id - Delete transaction (soft delete)
router.delete('/:id', validateId, deleteTransaction)

// POST /api/accounting/:id/approve - Approve transaction
router.post('/:id/approve', validateId, validateApproval, approveTransaction)

// POST /api/accounting/:id/reconcile - Reconcile transaction
router.post('/:id/reconcile', validateId, reconcileTransaction)

// POST /api/accounting/:id/dispute - Dispute transaction
router.post('/:id/dispute', validateId, validateDispute, disputeTransaction)

// POST /api/accounting/bulk-update - Bulk update transactions
router.post('/bulk-update', validateBulkUpdate, bulkUpdateTransactions)

export default router 