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

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crm_secret_key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token. User not found or inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Role-based access control middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['Admin']);

// Sales and Admin middleware
export const requireSalesOrAdmin = requireRole(['Admin', 'Sales Rep']);

// All authenticated users middleware (same as verifyToken but more semantic)
export const requireAuth = verifyToken;

// Check if user can access specific record (based on assignment)
export const checkRecordAccess = (model) => {
  return async (req, res, next) => {
    try {
      const recordId = req.params.id;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Admin can access all records
      if (userRole === 'Admin') {
        return next();
      }

      // Find the record
      const Record = model;
      const record = await Record.findById(recordId);

      if (!record) {
        return res.status(404).json({ message: 'Record not found.' });
      }

      // Check if user has access to this record
      const hasAccess = 
        record.assignedTo?.toString() === userId.toString() ||
        record.createdBy?.toString() === userId.toString() ||
        record.accountOwner?.toString() === userId.toString();

      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Access denied. You can only access records assigned to you.' 
        });
      }

      req.record = record;
      next();
    } catch (error) {
      console.error('Record access check error:', error);
      res.status(500).json({ message: 'Server error during access check.' });
    }
  };
};

// Filter records based on user role and assignment
export const filterUserRecords = (req, res, next) => {
  if (req.user.role === 'Admin') {
    // Admin can see all records
    req.userFilter = {};
  } else {
    // Non-admin users can only see their assigned records
    req.userFilter = {
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
        { accountOwner: req.user._id }
      ]
    };
  }
  next();
};

export default {
  verifyToken,
  requireRole,
  requireAdmin,
  requireSalesOrAdmin,
  requireAuth,
  checkRecordAccess,
  filterUserRecords
}; 