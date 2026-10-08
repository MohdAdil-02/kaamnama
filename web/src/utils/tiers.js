// Verification ladder from the Kaamnama product layout (section 5 and 13).
export const TIER_ORDER = ['T0', 'T1', 'T2', 'T3'];

export const TIERS = {
  T0: { key: 'T0', weight: 0, label: 'Unverified', tone: 'neutral',
    desc: { trade: "Worker's own claim only. Not counted in the score.", education: "Teacher's own claim only. Not counted in the score." } },
  T1: { key: 'T1', weight: 1, label: 'Confirmed', tone: 'primary',
    desc: { trade: 'Customer confirmed one job by OTP.', education: 'Parent or student confirmed one session by OTP.' } },
  T2: { key: 'T2', weight: 3, label: 'Payment-linked', tone: 'success',
    desc: { trade: 'T1 plus a UPI payment reference.', education: 'T1 plus a fee payment reference.' } },
  T3: { key: 'T3', weight: 5, label: 'Repeat customer', tone: 'violet',
    desc: { trade: 'The same customer gave a repeat job.', education: 'The student continued into a 2nd month.' } },
};

export const tierOf = (r) => {
  const t = r?.verificationTier || r?.tier;
  if (TIERS[t]) return t;
  return r?.status === 'verified' || r?.status === 'completed' ? 'T1' : 'T0';
};

export const weightedJobs = (counts = {}) => TIER_ORDER.reduce((sum, k) => sum + (counts[k] || 0) * TIERS[k].weight, 0);

export const nextTierHint = (counts = {}, vertical = 'trade') => {
  const confirmed = (counts.T1 || 0) + (counts.T2 || 0) + (counts.T3 || 0);
  if (!confirmed) return 'Get your first job confirmed by a customer to reach T1.';
  if (!counts.T2) return `Attach a payment reference to a ${vertical === 'education' ? 'session' : 'job'} to reach T2 (3x weight).`;
  if (!counts.T3) return vertical === 'education' ? 'Keep a student into a 2nd month to reach T3 (5x weight).' : 'Serve the same customer again to reach T3 (5x weight).';
  return 'Strong record. Keep earning repeat customers.';
};
