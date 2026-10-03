// Trust score is 0-100. Tiers are derived from score + verified job count.
export const TIERS = Object.freeze({
  NEW: "new",
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
});

// Ordered lowest -> highest
export const TIER_RULES = [
  { tier: TIERS.NEW,      minScore: 0,  minVerifiedJobs: 0  },
  { tier: TIERS.BRONZE,   minScore: 30, minVerifiedJobs: 3  },
  { tier: TIERS.SILVER,   minScore: 55, minVerifiedJobs: 10 },
  { tier: TIERS.GOLD,     minScore: 75, minVerifiedJobs: 30 },
  { tier: TIERS.PLATINUM, minScore: 90, minVerifiedJobs: 75 },
];

export const getTierForStats = (score, verifiedJobs) => {
  let result = TIERS.NEW;
  for (const rule of TIER_RULES) {
    if (score >= rule.minScore && verifiedJobs >= rule.minVerifiedJobs) {
      result = rule.tier;
    }
  }
  return result;
};