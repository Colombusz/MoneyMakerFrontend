import { describe, it, expect } from 'vitest';
import { validateRequired, validateEmail, validatePositiveAmount } from '../validation';

describe('validation utilities', () => {
  describe('validateRequired', () => {
    it('returns error when value is empty or undefined', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required');
      expect(validateRequired('   ', 'Name')).toBe('Name is required');
      expect(validateRequired(undefined, 'Name')).toBe('Name is required');
      expect(validateRequired(null, 'Name')).toBe('Name is required');
    });

    it('returns null when value is non-empty', () => {
      expect(validateRequired('Savings Account', 'Name')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name@domain.co.uk')).toBeNull();
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('not-an-email')).toBe('Please enter a valid email address');
      expect(validateEmail('missing@tld')).toBe('Please enter a valid email address');
      expect(validateEmail('')).toBe('Please enter a valid email address');
    });
  });

  describe('validatePositiveAmount', () => {
    it('returns null for positive integer amounts', () => {
      expect(validatePositiveAmount(100)).toBeNull();
      expect(validatePositiveAmount(500000)).toBeNull();
    });

    it('returns error for zero or negative amounts', () => {
      expect(validatePositiveAmount(0, 'Amount')).toBe('Amount must be greater than zero');
      expect(validatePositiveAmount(-50, 'Budget')).toBe('Budget must be greater than zero');
    });
  });
});
