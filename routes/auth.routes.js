const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  deactivateAccount
} = require('../controllers/auth.controller');

// Import middlewares
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange
} = require('../middlewares/validation.middleware');
const {
  authRateLimit,
  loginRateLimit
} = require('../middlewares/security.middleware');

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password, role }
 */
router.post('/register', 
  authRateLimit,
  validateRegistration,
  register
);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 * @body    { email, password }
 */
router.post('/login',
  loginRateLimit,
  validateLogin,
  login
);

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.get('/me',
  authenticate,
  getMe
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.post('/logout',
  authenticate,
  logout
);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh',
  authRateLimit,
  refreshToken
);

/**
 * @route   PUT /auth/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { name }
 * @header  Authorization: Bearer <token>
 */
router.put('/profile',
  authenticate,
  updateProfile
);

/**
 * @route   PUT /auth/password
 * @desc    Change password
 * @access  Private
 * @body    { currentPassword, newPassword }
 * @header  Authorization: Bearer <token>
 */
router.put('/password',
  authenticate,
  validatePasswordChange,
  changePassword
);

/**
 * @route   DELETE /auth/account
 * @desc    Deactivate user account
 * @access  Private
 * @header  Authorization: Bearer <token>
 */
router.delete('/account',
  authenticate,
  deactivateAccount
);

module.exports = router;
