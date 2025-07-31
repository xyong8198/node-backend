// In-memory token blacklist (for production, use Redis or database)
class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Set();
    this.tokenExpiry = new Map();
    
    // Clean up expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  }

  addToken(token, expiryTime) {
    this.blacklistedTokens.add(token);
    this.tokenExpiry.set(token, expiryTime);
  }

  isBlacklisted(token) {
    return this.blacklistedTokens.has(token);
  }

  removeToken(token) {
    this.blacklistedTokens.delete(token);
    this.tokenExpiry.delete(token);
  }

  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, expiry] of this.tokenExpiry.entries()) {
      if (expiry <= now) {
        this.removeToken(token);
      }
    }
    console.log(`🧹 Cleaned up expired tokens. Active blacklisted tokens: ${this.blacklistedTokens.size}`);
  }

  getBlacklistedCount() {
    return this.blacklistedTokens.size;
  }
}

// Singleton instance
const tokenBlacklist = new TokenBlacklist();

module.exports = tokenBlacklist;
