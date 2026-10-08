import { describe, it, expect } from 'vitest';
import { isPhone, isPincode, isOtp, required } from '../validators';

describe('validators', () => {
  it('validates Indian mobile numbers', () => { expect(isPhone('9876543210')).toBe(true); expect(isPhone('1234567890')).toBe(false); expect(isPhone('98765')).toBe(false); });
  it('validates pincodes', () => { expect(isPincode('275101')).toBe(true); expect(isPincode('075101')).toBe(false); });
  it('validates OTPs', () => { expect(isOtp('123456')).toBe(true); expect(isOtp('12a456')).toBe(false); });
  it('flags empty required fields', () => { expect(required('  ')).toBeTruthy(); expect(required('x')).toBe(''); });
});
