import { describe, it, expect } from "vitest";
import { calculateScore } from "../../src/services/trustScore.service.js";
import { getTierForStats, TIERS } from "../../src/constants/tiers.js";

const base = {
  verifiedJobs: 0,
  ratingsCount: 0,
  ratingsSum: 0,
  repeatCustomers: 0,
  disputedOrRejected: 0,
  processed: 0,
  accountAgeDays: 0,
};

describe("calculateScore", () => {
  it("gives a brand new worker a score of 0", () => {
    expect(calculateScore(base).score).toBe(0);
  });

  it("caps the maximum at 100", () => {
    const { score } = calculateScore({
      verifiedJobs: 500,
      ratingsCount: 500,
      ratingsSum: 2500,
      repeatCustomers: 50,
      disputedOrRejected: 0,
      processed: 500,
      accountAgeDays: 1000,
    });
    expect(score).toBe(100);
  });

  it("does not let one 5-star rating max out the ratings component", () => {
    const { parts } = calculateScore({ ...base, ratingsCount: 1, ratingsSum: 5 });
    expect(parts.ratings).toBeLessThan(30);
    expect(parts.ratings).toBeGreaterThan(0);
  });

  it("gives zero rating points when there are no ratings", () => {
    expect(calculateScore(base).parts.ratings).toBe(0);
  });

  it("lowers reliability as the dispute rate rises", () => {
    const clean = calculateScore({ ...base, verifiedJobs: 10, processed: 10 });
    const messy = calculateScore({ ...base, verifiedJobs: 5, disputedOrRejected: 5, processed: 10 });
    expect(clean.parts.reliability).toBe(10);
    expect(messy.parts.reliability).toBe(5);
    expect(messy.disputeRate).toBe(0.5);
  });

  it("caps repeat customers at 5", () => {
    const five = calculateScore({ ...base, repeatCustomers: 5 }).parts.repeat;
    const twenty = calculateScore({ ...base, repeatCustomers: 20 }).parts.repeat;
    expect(five).toBe(15);
    expect(twenty).toBe(15);
  });

  it("increases with more verified jobs", () => {
    const a = calculateScore({ ...base, verifiedJobs: 3 }).score;
    const b = calculateScore({ ...base, verifiedJobs: 30 }).score;
    expect(b).toBeGreaterThan(a);
  });
});

describe("getTierForStats", () => {
  it("starts at new", () => {
    expect(getTierForStats(0, 0)).toBe(TIERS.NEW);
  });

  it("needs BOTH score and job count", () => {
    expect(getTierForStats(95, 0)).toBe(TIERS.NEW);
    expect(getTierForStats(0, 100)).toBe(TIERS.NEW);
  });

  it("reaches bronze at score 30 with 3 verified jobs", () => {
    expect(getTierForStats(30, 3)).toBe(TIERS.BRONZE);
    expect(getTierForStats(29, 3)).toBe(TIERS.NEW);
    expect(getTierForStats(30, 2)).toBe(TIERS.NEW);
  });

  it("reaches platinum only at the top", () => {
    expect(getTierForStats(90, 75)).toBe(TIERS.PLATINUM);
    expect(getTierForStats(89, 75)).toBe(TIERS.GOLD);
  });
});