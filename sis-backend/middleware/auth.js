import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

// Protect routes - require authentication
export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token

      // Get token from header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
      }

      // Check if token exists
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        })
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)

        // Get user from token
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token. User not found.'
          })
        }

        // Check if user is active
        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated.'
          })
        }

        // Check if user is locked
        if (user.isLocked) {
          return res.status(401).json({
            success: false,
            message: 'Account is locked. Please contact administrator.'
          })
        }

        // Check role permissions if specified
        if (roles.length > 0 && !roles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
          })
        }

        // Add user to request object
        req.user = user
        next()
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        })
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(500).json({
        success: false,
        message: 'Authentication error.'
      })
    }
  }
}

// Optional authentication - doesn't require token but adds user if present
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)

        // Get user from token
        const user = await User.findById(decoded.id).select('-password')
        if (user && user.isActive && !user.isLocked) {
          req.user = user
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth: Invalid token')
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    next()
  }
}

// Check specific permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      })
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires permission: ${permission}`
      })
    }

    next()
  }
}

// Rate limiting middleware
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map()

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean old entries
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart)
      requests.set(ip, userRequests)
    } else {
      requests.set(ip, [])
    }

    const userRequests = requests.get(ip)

    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      })
    }

    userRequests.push(now)
    next()
  }
}

// Admin only middleware
export const adminOnly = protect(['admin'])

// Staff only middleware (admin, registrar, finance, instructor)
export const staffOnly = protect(['admin', 'registrar', 'finance', 'instructor'])

// Student only middleware
export const studentOnly = protect(['student'])

// Finance only middleware
export const financeOnly = protect(['admin', 'finance'])

// Registrar only middleware
export const registrarOnly = protect(['admin', 'registrar'])

// Instructor only middleware
export const instructorOnly = protect(['admin', 'instructor']) 