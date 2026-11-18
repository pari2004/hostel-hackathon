const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (for web dashboard)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No user found with this token'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        error: 'Account is temporarily locked due to failed login attempts'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check specific permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required to access this route`
      });
    }

    next();
  };
};

// Check if user owns the resource or has admin privileges
const checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    // Admin and wardens can access any resource
    if (['admin', 'warden'].includes(req.user.role)) {
      return next();
    }

    // For students and parents, check ownership
    const resourceUserId = req.body[resourceUserField] || req.params.userId || req.user._id;
    
    if (req.user.role === 'student') {
      // Students can only access their own resources
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this resource'
        });
      }
    } else if (req.user.role === 'parent') {
      // Parents can access their children's resources
      const isChild = req.user.children.some(childId => 
        childId.toString() === resourceUserId.toString()
      );
      
      if (!isChild && req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this resource'
        });
      }
    }

    next();
  };
};

// Rate limiting for authentication endpoints
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || '');
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempt = attempts.get(key);
    
    if (now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (attempt.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((attempt.resetTime - now) / 1000)
      });
    }

    attempt.count++;
    next();
  };
};

// Middleware to log user activity
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      logger.info(`User ${req.user.email} performed action: ${action}`, {
        userId: req.user._id,
        userRole: req.user.role,
        action: action,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      });
    }
    next();
  };
};

// Middleware to check if email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required to access this route'
    });
  }

  next();
};

// Middleware to validate student access to their own data
const validateStudentAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  // Admin and wardens have full access
  if (['admin', 'warden'].includes(req.user.role)) {
    return next();
  }

  // Students can only access their own data
  if (req.user.role === 'student') {
    const studentId = req.params.studentId || req.body.studentId || req.user.studentId;
    
    if (req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'Students can only access their own data'
      });
    }
  }

  // Parents can access their children's data
  if (req.user.role === 'parent') {
    const studentId = req.params.studentId || req.body.studentId;
    
    if (studentId) {
      const student = await User.findOne({ studentId: studentId });
      
      if (!student || !req.user.children.includes(student._id)) {
        return res.status(403).json({
          success: false,
          error: 'Parents can only access their children\'s data'
        });
      }
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  checkOwnership,
  authRateLimit,
  logActivity,
  requireEmailVerification,
  validateStudentAccess
};
