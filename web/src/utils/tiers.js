// Keep in sync with backend constants/tiers.js
export const TIER_ORDER = ['new', 'bronze', 'silver', 'gold', 'platinum'];

export const TIERS = {
  new:      { key: 'new',      label: 'New',      tone: 'neutral', minScore: 0,  minJobs: 0,  desc: 'Just getting started.' },
  bronze:   { key: 'bronze',   label: 'Bronze',   tone: 'primary', minScore: 30, minJobs: 3,  desc: '3+ verified jobs and a score of 30+.' },
  silver:   { key: 'silver',   label: 'Silver',   tone: 'primary', minScore: 55, minJobs: 10, desc: '10+ verified jobs and a score of 55+.' },
  gold:     { key: 'gold',     label: 'Gold',     tone: 'success', minScore: 75, minJobs: 30, desc: '30+ verified jobs and a score of 75+.' },
  platinum: { key: 'platinum', label: 'Platinum', tone: 'violet',  minScore: 90, minJobs: 75, desc: '75+ verified jobs and a score of 90+.' },
};

// Tier is a property of the worker, not of a single receipt
export const tierOf = (workerOrTier) => {
  const t = typeof workerObj(workerOrTier) === 'string' ? workerObj(workerOrTier) : workerObj(workerOrTier)?.tier;
  return TIERS[t] ? t : 'new';
};
function workerObj(x) { return x; }

export const tierLabel = (tier) => (TIERS[tier] || TIERS.new).label;

// Same shape the backend returns in trust.nextTier
export const nextTierHint = (n) => {
  if (!n) return 'You are at the highest tier.';
  const parts = [];
  if (n.jobsGap > 0) parts.push(`${n.jobsGap} more verified job${n.jobsGap > 1 ? 's' : ''}`);
  if (n.scoreGap > 0) parts.push(`${n.scoreGap} more score points`);
  return parts.length ? `To reach ${tierLabel(n.tier)}: ${parts.join(' and ')}.` : `You qualify for ${tierLabel(n.tier)} on the next update.`;
};