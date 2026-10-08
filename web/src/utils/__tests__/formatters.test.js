import { describe, it, expect } from 'vitest';
import { maskPhone, formatPhone, receiptTitle, initials, monthsLabel } from '../formatters';

describe('formatters', () => {
  it('masks phone numbers', () => { expect(maskPhone('9876543210')).toBe('98******10'); });
  it('formats phone with +91', () => { expect(formatPhone('9876543210')).toBe('+91 9876543210'); expect(formatPhone('+919876543210')).toBe('+91 9876543210'); });
  it('picks a receipt title', () => { expect(receiptTitle({ workType: 'Wiring' })).toBe('Wiring'); expect(receiptTitle({})).toBe('Job'); });
  it('builds initials', () => { expect(initials('Rajesh Kumar')).toBe('RK'); });
  it('formats months', () => { expect(monthsLabel(14)).toBe('1 yr 2 mo'); expect(monthsLabel(5)).toBe('5 months'); });
});
