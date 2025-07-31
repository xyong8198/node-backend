const JWTUtil = require('../utils/jwt.util');
const tokenBlacklist = require('../utils/tokenBlacklist.util');
const User = require('../models/user.model');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated'
      });
    }

    // Verify token
    const decoded = JWTUtil.verifyToken(token);

    // Check if user still exists and is active
    const user = await User.findOne({
      where: {
        id: decoded.id,
        is_active: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    req.decoded = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token'
    });
  }
};

/**
 * Authorization middleware - checks user roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractTokenFromHeader(authHeader);

    if (token && !tokenBlacklist.isBlacklisted(token)) {
      const decoded = JWTUtil.verifyToken(token);
      const user = await User.findOne({
        where: {
          id: decoded.id,
          is_active: true
        }
      });

      if (user) {
        req.user = user;
        req.token = token;
        req.decoded = decoded;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
