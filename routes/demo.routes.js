const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   GET /demo/public
 * @desc    Public endpoint accessible to everyone (including guests)
 * @access  Public
 */
router.get('/public', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is a public endpoint accessible to everyone',
    data: {
      timestamp: new Date().toISOString(),
      userRole: req.user ? req.user.role : 'guest'
    }
  });
}));

/**
 * @route   GET /demo/optional-auth
 * @desc    Endpoint with optional authentication
 * @access  Public (enhanced for authenticated users)
 */
router.get('/optional-auth', optionalAuth, asyncHandler(async (req, res) => {
  const responseData = {
    timestamp: new Date().toISOString(),
    message: 'This endpoint works for both authenticated and unauthenticated users'
  };

  if (req.user) {
    responseData.user = {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    };
    responseData.message += ' (you are authenticated)';
  } else {
    responseData.message += ' (you are a guest)';
  }

  res.status(200).json({
    success: true,
    data: responseData
  });
}));

/**
 * @route   GET /demo/authenticated
 * @desc    Endpoint requiring authentication (any role)
 * @access  Private
 */
router.get('/authenticated', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint requires authentication',
    data: {
      user: req.user.toJSON(),
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @route   GET /demo/customer-only
 * @desc    Endpoint accessible only to customers
 * @access  Private (Customer only)
 */
router.get('/customer-only', 
  authenticate, 
  authorize('customer'), 
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'This endpoint is only accessible to customers',
      data: {
        user: req.user.toJSON(),
        customerFeatures: [
          'Browse restaurants',
          'Add items to cart',
          'Place orders',
          'Track orders',
          'Leave reviews'
        ]
      }
    });
  })
);

/**
 * @route   GET /demo/owner-only
 * @desc    Endpoint accessible only to restaurant owners
 * @access  Private (Owner only)
 */
router.get('/owner-only', 
  authenticate, 
  authorize('owner'), 
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'This endpoint is only accessible to restaurant owners',
      data: {
        user: req.user.toJSON(),
        ownerFeatures: [
          'Manage restaurant profile',
          'Add/edit menu items',
          'View orders',
          'Manage inventory',
          'View analytics'
        ]
      }
    });
  })
);

/**
 * @route   GET /demo/customer-or-owner
 * @desc    Endpoint accessible to both customers and owners
 * @access  Private (Customer or Owner)
 */
router.get('/customer-or-owner', 
  authenticate, 
  authorize('customer', 'owner'), 
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'This endpoint is accessible to both customers and restaurant owners',
      data: {
        user: req.user.toJSON(),
        sharedFeatures: [
          'View profile',
          'Update personal information',
          'Access support',
          'View notifications'
        ]
      }
    });
  })
);

/**
 * @route   GET /demo/guest-attempt
 * @desc    Demonstrates what happens when guests try to access protected endpoints
 * @access  Private (will return 401 for guests)
 */
router.get('/guest-attempt', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'If you see this, you are authenticated (not a guest)',
    data: {
      user: req.user.toJSON()
    }
  });
}));

module.exports = router;
