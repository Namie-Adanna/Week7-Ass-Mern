// Unit tests for User model
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('user'); // default role
      expect(user.password).not.toBe('password123'); // should be hashed
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'plainpassword',
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('plainpassword');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.email).toBe('test@example.com');
    });

    it('should set default avatar', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.avatar).toBe('default-avatar.jpg');
    });
  });

  describe('Validation', () => {
    it('should require name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should require email', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should require password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce maximum name length', async () => {
      const userData = {
        name: 'a'.repeat(51),
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData1 = {
        name: 'User One',
        email: 'same@example.com',
        password: 'password123',
      };

      const userData2 = {
        name: 'User Two',
        email: 'same@example.com',
        password: 'password456',
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Methods', () => {
    describe('matchPassword', () => {
      it('should return true for correct password', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        };

        const user = new User(userData);
        await user.save();

        const isMatch = await user.matchPassword('password123');
        expect(isMatch).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        };

        const user = new User(userData);
        await user.save();

        const isMatch = await user.matchPassword('wrongpassword');
        expect(isMatch).toBe(false);
      });
    });
  });

  describe('Password Hashing', () => {
    it('should not rehash password if not modified', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();
      
      const originalHash = user.password;
      
      // Update name without changing password
      user.name = 'Updated Name';
      await user.save();
      
      expect(user.password).toBe(originalHash);
    });

    it('should rehash password when modified', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();
      
      const originalHash = user.password;
      
      // Update password
      user.password = 'newpassword123';
      await user.save();
      
      expect(user.password).not.toBe(originalHash);
      expect(user.password).not.toBe('newpassword123');
    });
  });

  describe('Role Management', () => {
    it('should default to user role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.role).toBe('user');
    });

    it('should accept admin role', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      };

      const user = new User(userData);
      await user.save();

      expect(user.role).toBe('admin');
    });

    it('should reject invalid roles', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role',
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });
  });
});