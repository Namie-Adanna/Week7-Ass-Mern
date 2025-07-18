// Unit tests for formatter utilities
import {
  formatDate,
  formatRelativeTime,
  truncateText,
  slugify,
  capitalizeFirst,
  formatNumber,
} from '../../../utils/formatters';

describe('Formatter Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly with default options', () => {
      const date = new Date('2023-12-25');
      const result = formatDate(date);
      expect(result).toBe('December 25, 2023');
    });

    it('should format date with custom options', () => {
      const date = new Date('2023-12-25');
      const result = formatDate(date, { month: 'short', day: '2-digit' });
      expect(result).toBe('Dec 25, 2023');
    });

    it('should return empty string for null/undefined date', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-12-25T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for recent dates', () => {
      const date = new Date('2023-12-25T11:59:30Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should return minutes ago for dates within an hour', () => {
      const date = new Date('2023-12-25T11:45:00Z');
      expect(formatRelativeTime(date)).toBe('15 minutes ago');
    });

    it('should return hours ago for dates within a day', () => {
      const date = new Date('2023-12-25T10:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 hours ago');
    });

    it('should return days ago for dates within a month', () => {
      const date = new Date('2023-12-23T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should return formatted date for older dates', () => {
      const date = new Date('2023-10-25T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('October 25, 2023');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const text = 'This is a very long text that should be truncated';
      const result = truncateText(text, 20);
      expect(result).toBe('This is a very long...');
    });

    it('should return original text if shorter than maxLength', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe('Short text');
    });

    it('should handle null/undefined text', () => {
      expect(truncateText(null)).toBeUndefined();
      expect(truncateText(undefined)).toBeUndefined();
    });
  });

  describe('slugify', () => {
    it('should convert text to slug format', () => {
      const text = 'Hello World! This is a Test';
      const result = slugify(text);
      expect(result).toBe('hello-world-this-is-a-test');
    });

    it('should handle special characters', () => {
      const text = 'React & JavaScript: A Guide!';
      const result = slugify(text);
      expect(result).toBe('react-javascript-a-guide');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
      expect(slugify(null)).toBe('');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('HELLO')).toBe('HELLO');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
      expect(capitalizeFirst(null)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('should format large numbers with M suffix', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(2000000)).toBe('2.0M');
    });

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(2000)).toBe('2.0K');
    });

    it('should return string for small numbers', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle non-number input', () => {
      expect(formatNumber('invalid')).toBe('0');
      expect(formatNumber(null)).toBe('0');
    });
  });
});