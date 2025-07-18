// Unit tests for validator utilities
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUrl,
  validatePostData,
  validateUserData,
} from '../../../utils/validators';

describe('Validator Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate passwords with 6+ characters', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(0)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('should validate strings meeting minimum length', () => {
      expect(validateMinLength('hello', 3)).toBe(true);
      expect(validateMinLength('hello', 5)).toBe(true);
    });

    it('should reject strings below minimum length', () => {
      expect(validateMinLength('hi', 3)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('should validate strings within maximum length', () => {
      expect(validateMaxLength('hello', 10)).toBe(true);
      expect(validateMaxLength('hello', 5)).toBe(true);
      expect(validateMaxLength('', 5)).toBe(true);
    });

    it('should reject strings exceeding maximum length', () => {
      expect(validateMaxLength('hello world', 5)).toBe(false);
    });

    it('should handle null/undefined values', () => {
      expect(validateMaxLength(null, 5)).toBe(true);
      expect(validateMaxLength(undefined, 5)).toBe(true);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validatePostData', () => {
    const validPostData = {
      title: 'Test Post',
      content: 'This is test content',
      category: 'tech',
      excerpt: 'Short excerpt',
    };

    it('should validate correct post data', () => {
      const result = validatePostData(validPostData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject post without title', () => {
      const invalidData = { ...validPostData, title: '' };
      const result = validatePostData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title is required');
    });

    it('should reject post with long title', () => {
      const invalidData = { ...validPostData, title: 'a'.repeat(101) };
      const result = validatePostData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be less than 100 characters');
    });

    it('should reject post without content', () => {
      const invalidData = { ...validPostData, content: '' };
      const result = validatePostData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.content).toBe('Content is required');
    });

    it('should reject post without category', () => {
      const invalidData = { ...validPostData, category: '' };
      const result = validatePostData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.category).toBe('Category is required');
    });

    it('should reject post with long excerpt', () => {
      const invalidData = { ...validPostData, excerpt: 'a'.repeat(201) };
      const result = validatePostData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.excerpt).toBe('Excerpt must be less than 200 characters');
    });
  });

  describe('validateUserData', () => {
    const validUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should validate correct user data', () => {
      const result = validateUserData(validUserData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject user without name', () => {
      const invalidData = { ...validUserData, name: '' };
      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });

    it('should reject user with invalid email', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email');
    });

    it('should reject user with short password', () => {
      const invalidData = { ...validUserData, password: '123' };
      const result = validateUserData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password must be at least 6 characters');
    });
  });
});