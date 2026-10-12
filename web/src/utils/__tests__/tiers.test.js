import { describe, it, expect } from 'vitest';
import { TIER_ORDER, tierOf, tierLabel, nextTierHint } from '../tiers';

describe('tiers', () => {
  it('lists tiers lowest to highest', () => {
    expect(TIER_ORDER).toEqual(['new', 'bronze', 'silver', 'gold', 'platinum']);
  });
  it('falls back to new for unknown input', () => {
    expect(tierOf(undefined)).toBe('new');
    expect(tierOf('T1')).toBe('new');
  });
  it('reads a tier from a worker object or a string', () => {
    expect(tierOf({ tier: 'gold' })).toBe('gold');
    expect(tierOf('silver')).toBe('silver');
  });
  it('labels tiers', () => {
    expect(tierLabel('platinum')).toBe('Platinum');
  });
  it('describes what is needed for the next tier', () => {
    expect(nextTierHint({ tier: 'bronze', jobsGap: 2, scoreGap: 5 })).toBe('To reach Bronze: 2 more verified jobs and 5 more score points.');
    expect(nextTierHint(null)).toMatch(/highest/);
  });
});