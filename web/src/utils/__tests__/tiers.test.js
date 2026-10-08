import { describe, it, expect } from 'vitest';
import { tierOf, weightedJobs, nextTierHint, TIERS } from '../tiers';

describe('tiers', () => {
  it('uses the weights from the product spec', () => {
    expect([TIERS.T0.weight, TIERS.T1.weight, TIERS.T2.weight, TIERS.T3.weight]).toEqual([0, 1, 3, 5]);
  });
  it('computes weighted jobs', () => { expect(weightedJobs({ T1: 2, T2: 1, T3: 1 })).toBe(2 + 3 + 5); });
  it('derives a tier from a receipt', () => {
    expect(tierOf({ verificationTier: 'T3' })).toBe('T3');
    expect(tierOf({ status: 'verified' })).toBe('T1');
    expect(tierOf({ status: 'pending' })).toBe('T0');
  });
  it('suggests the next step', () => {
    expect(nextTierHint({})).toMatch(/first job/);
    expect(nextTierHint({ T1: 3 })).toMatch(/T2/);
    expect(nextTierHint({ T1: 1, T2: 1 })).toMatch(/T3/);
  });
});
