// Unit tests for auth middleware
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../../../middleware/auth');
const User = require('../../../models/User');

// Mock User model
jest.mock('../../../models/User');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      User.findById.mockResolvedValue(mockUser);

      await protect(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request when user not found', async () => {
      const token = jwt.sign({ id: 'nonexistent' }, process.env.JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      User.findById.mockResolvedValue(null);

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'user123', exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET
      );
      req.headers.authorization = `Bearer ${expiredToken}`;

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    beforeEach(() => {
      req.user = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };
    });

    it('should allow access for authorized role', () => {
      const middleware = authorize('user', 'admin');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const middleware = authorize('admin');
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User role user is not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow admin access to admin-only routes', () => {
      req.user.role = 'admin';
      const middleware = authorize('admin');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle multiple allowed roles', () => {
      const middleware = authorize('admin', 'moderator', 'user');
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when no roles match', () => {
      const middleware = authorize('admin', 'moderator');
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User role user is not authorized to access this route',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});