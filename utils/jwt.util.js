const jwt = require('jsonwebtoken');

class JWTUtil {
  static generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'restaurant-api',
        audience: 'restaurant-app'
      }
    );
  }

  static generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'restaurant-api',
        audience: 'restaurant-app'
      }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'restaurant-api',
        audience: 'restaurant-app'
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  static generateTokenPayload(user) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      is_active: user.is_active
    };
  }
}

module.exports = JWTUtil;
