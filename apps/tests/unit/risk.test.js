import { describe, it, expect } from "vitest";
import { calculateRisk, FLAG_THRESHOLD } from "../../src/services/risk.service.js";

const calm = { verified: 10, distinctCustomers: 8, topCustomerJobs: 2, fastConfirms: 0, maxIn24h: 2 };

describe("calculateRisk", () => {
  it("does not flag a normal worker", () => {
    const r = calculateRisk(calm);
    expect(r.score).toBe(0);
    expect(r.flagged).toBe(false);
  });

  it("ignores concentration when there are too few jobs to judge", () => {
    const r = calculateRisk({ ...calm, verified: 3, distinctCustomers: 1, topCustomerJobs: 3 });
    expect(r.signals.map((s) => s.code)).not.toContain("concentration");
  });

  it("flags a worker whose jobs all come from one customer", () => {
    const r = calculateRisk({ verified: 8, distinctCustomers: 1, topCustomerJobs: 8, fastConfirms: 0, maxIn24h: 2 });
    expect(r.signals.map((s) => s.code)).toEqual(expect.arrayContaining(["concentration", "few_customers"]));
    expect(r.flagged).toBe(true);
  });

  it("flags fast confirmations combined with a burst", () => {
    const r = calculateRisk({ ...calm, fastConfirms: 5, maxIn24h: 6, topCustomerJobs: 6 });
    expect(r.signals.map((s) => s.code)).toEqual(expect.arrayContaining(["fast_confirmations", "burst"]));
  });

  it("flags only at or above the threshold", () => {
    const r = calculateRisk({ ...calm, fastConfirms: 3 }); // only 20 points
    expect(r.score).toBeLessThan(FLAG_THRESHOLD);
    expect(r.flagged).toBe(false);
  });

  it("never exceeds 100", () => {
    const r = calculateRisk({ verified: 20, distinctCustomers: 1, topCustomerJobs: 20, fastConfirms: 20, maxIn24h: 20 });
    expect(r.score).toBeLessThanOrEqual(100);
  });
});