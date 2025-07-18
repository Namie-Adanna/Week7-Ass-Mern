// Unit tests for auth utilities
const jwt = require('jsonwebtoken');

// Create auth utility functions
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

describe('Auth Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user123';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user ID in token payload', () => {
      const userId = 'user123';
      const token = generateToken(userId);
      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(userId);
    });

    it('should set expiration time', () => {
      const userId = 'user123';
      const token = generateToken(userId);
      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1');
      const token2 = generateToken('user2');

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const userId = 'user123';
      const token = generateToken(userId);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { id: 'user123', exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET
      );

      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign({ id: 'user123' }, 'wrong-secret');

      expect(() => verifyToken(tokenWithWrongSecret)).toThrow();
    });
  });

  describe('Token Integration', () => {
    it('should create and verify token successfully', () => {
      const userId = 'user123';
      const token = generateToken(userId);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(userId);
    });

    it('should handle token lifecycle', () => {
      const userId = 'user123';
      
      // Generate token
      const token = generateToken(userId);
      expect(token).toBeDefined();
      
      // Verify token
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(userId);
      
      // Check expiration
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });
});

// Export utilities for use in other files
module.exports = {
  generateToken,
  verifyToken,
};