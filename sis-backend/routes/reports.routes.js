import express from 'express'
import { body, query, param } from 'express-validator'
import {
  admissionsSummary,
  financeStats,
  registrarBreakdown,
  placementOutcomes,
  exportReport,
  generateCustomReport,
  getReportTemplates,
  scheduleReport
} from '../controllers/reports.controller.js'

const router = express.Router()

// Validation middleware
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('campus')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Campus filter cannot be empty'),
  query('program')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Program filter cannot be empty'),
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

const validateExport = [
  query('format')
    .optional()
    .isIn(['json', 'csv', 'pdf', 'excel'])
    .withMessage('Export format must be json, csv, pdf, or excel'),
  query('filters')
    .optional()
    .isJSON()
    .withMessage('Filters must be valid JSON')
]

const validateCustomReport = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Report name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('module')
    .isIn(['admissions', 'finance', 'registrar', 'placement', 'accounting'])
    .withMessage('Invalid module'),
  body('filters')
    .isObject()
    .withMessage('Filters must be an object'),
  body('groupBy')
    .optional()
    .isArray()
    .withMessage('Group by must be an array'),
  body('metrics')
    .isArray({ min: 1 })
    .withMessage('At least one metric is required'),
  body('schedule')
    .optional()
    .isObject()
    .withMessage('Schedule must be an object')
]

const validateSchedule = [
  body('frequency')
    .isIn(['daily', 'weekly', 'monthly', 'quarterly'])
    .withMessage('Invalid frequency'),
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('At least one recipient is required'),
  body('recipients.*')
    .isEmail()
    .withMessage('Invalid email address'),
  body('format')
    .isIn(['pdf', 'csv', 'excel'])
    .withMessage('Invalid format for scheduled reports')
]

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID format')
]

// Routes

// GET /api/reports/admissions - Get admissions summary
router.get('/admissions', validateDateRange, admissionsSummary)

// GET /api/reports/finance - Get finance statistics
router.get('/finance', validateDateRange, financeStats)

// GET /api/reports/registrar - Get registrar breakdown
router.get('/registrar', validateDateRange, registrarBreakdown)

// GET /api/reports/placement - Get placement outcomes
router.get('/placement', validateDateRange, placementOutcomes)

// GET /api/reports/templates - Get available report templates
router.get('/templates', getReportTemplates)

// POST /api/reports/custom - Create custom report
router.post('/custom', validateCustomReport, generateCustomReport)

// POST /api/reports/schedule - Schedule recurring report
router.post('/schedule', validateSchedule, scheduleReport)

// GET /api/reports/export/:type - Export report
router.get('/export/:type', validateExport, exportReport)

// GET /api/reports/:id - Get specific report
router.get('/:id', validateId, (req, res) => {
  // Get specific report by ID
  res.json({ message: 'Get specific report' })
})

// PUT /api/reports/:id - Update report
router.put('/:id', validateId, validateCustomReport, (req, res) => {
  // Update report
  res.json({ message: 'Update report' })
})

// DELETE /api/reports/:id - Delete report
router.delete('/:id', validateId, (req, res) => {
  // Delete report
  res.json({ message: 'Delete report' })
})

export default router 