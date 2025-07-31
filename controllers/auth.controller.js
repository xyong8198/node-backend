const User = require('../models/user.model');
const JWTUtil = require('../utils/jwt.util');
const tokenBlacklist = require('../utils/tokenBlacklist.util');
const { asyncHandler, AppError } = require('../middlewares/error.middleware');

/**
 * Register a new user
 * POST /auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Generate tokens
  const payload = JWTUtil.generateTokenPayload(user);
  const accessToken = JWTUtil.generateAccessToken(payload);
  const refreshToken = JWTUtil.generateRefreshToken({ id: user.id });

  // Log registration
  console.log(`✅ New user registered: ${user.email} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    }
  });
});

/**
 * Authenticate user and return JWT
 * POST /auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findActiveByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Validate password
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const payload = JWTUtil.generateTokenPayload(user);
  const accessToken = JWTUtil.generateAccessToken(payload);
  const refreshToken = JWTUtil.generateRefreshToken({ id: user.id });

  // Log successful login
  console.log(`🔐 User logged in: ${user.email} (${user.role})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    }
  });
});

/**
 * Get current authenticated user
 * GET /auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req by auth middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: user.toJSON()
    }
  });
});

/**
 * Logout user (invalidate token)
 * POST /auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.token;
  const decoded = req.decoded;

  // Add token to blacklist with expiry time
  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  tokenBlacklist.addToken(token, expiryTime);

  // Log logout
  console.log(`🚪 User logged out: ${req.user.email}`);

  res.status(204).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Refresh access token
 * POST /auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    // Verify refresh token
    const decoded = JWTUtil.verifyToken(token);

    // Find user
    const user = await User.findOne({
      where: {
        id: decoded.id,
        is_active: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new access token
    const payload = JWTUtil.generateTokenPayload(user);
    const accessToken = JWTUtil.generateAccessToken(payload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
});

/**
 * Update user profile
 * PUT /auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  // Update user
  await user.update({ name });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON()
    }
  });
});

/**
 * Change password
 * PUT /auth/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  // Validate current password
  const isCurrentPasswordValid = await user.validatePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  await user.update({ password: newPassword });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Deactivate account
 * DELETE /auth/account
 */
const deactivateAccount = asyncHandler(async (req, res) => {
  const user = req.user;
  const token = req.token;
  const decoded = req.decoded;

  // Deactivate user account
  await user.update({ is_active: false });

  // Blacklist current token
  const expiryTime = decoded.exp * 1000;
  tokenBlacklist.addToken(token, expiryTime);

  // Log account deactivation
  console.log(`❌ Account deactivated: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  updateProfile,
  changePassword,
  deactivateAccount
};
