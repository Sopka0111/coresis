import express from 'express'
import { body, param } from 'express-validator'
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'registrar', 'finance', 'instructor', 'student'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters')
]

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address')
]

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
]

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Invalid theme preference'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language preference'),
  body('preferences.notifications')
    .optional()
    .isObject()
    .withMessage('Notification preferences must be an object'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be a boolean')
]

const validateToken = [
  param('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required')
]

const validateRefreshToken = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
]

// Routes

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, register)

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login)

// POST /api/auth/logout - Logout user
router.post('/logout', logout)

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', validateRefreshToken, refreshToken)

// POST /api/auth/request-reset - Request password reset
router.post('/request-reset', validatePasswordReset, requestPasswordReset)

// POST /api/auth/reset/:token - Reset password
router.post('/reset/:token', validateToken, validatePasswordChange, resetPassword)

// POST /api/auth/request-verification - Request email verification
router.post('/request-verification', validatePasswordReset, requestEmailVerification)

// POST /api/auth/verify/:token - Verify email
router.post('/verify/:token', validateToken, verifyEmail)

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', protect(), getProfile)

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', protect(), validateProfileUpdate, updateProfile)

// POST /api/auth/change-password - Change password (protected)
router.post('/change-password', protect(), validatePasswordChange, changePassword)

export default router 