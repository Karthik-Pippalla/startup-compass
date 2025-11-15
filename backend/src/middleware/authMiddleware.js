const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

/**
 * Middleware to verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login to access this resource.',
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by ID
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Add user info to request
      req.user = user;
      req.userId = user._id;
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this resource',
      });
    }

    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type '${req.user.userType}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, authorize, generateToken };

