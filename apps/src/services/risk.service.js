import mongoose from "mongoose";
import JobReceipt from "../models/JobReceipt.js";
import Worker from "../models/Worker.js";
import { RECEIPT_STATUS } from "../constants/statuses.js";

const DAY_MS = 24 * 60 * 60 * 1000;
export const FLAG_THRESHOLD = 40;

// Pure function: easy to unit test and tune
export const calculateRisk = ({ verified, distinctCustomers, topCustomerJobs, fastConfirms, maxIn24h }) => {
  const signals = [];

  if (verified >= 4) {
    const share = topCustomerJobs / verified;
    if (share > 0.5) {
      const points = Math.round(35 * ((share - 0.5) / 0.5));
      if (points > 0) {
        signals.push({
          code: "concentration",
          points,
          detail: `${Math.round(share * 100)}% of verified jobs come from one customer`,
        });
      }
    }
  }

  if (verified >= 5 && distinctCustomers <= 2) {
    signals.push({
      code: "few_customers",
      points: 20,
      detail: `${verified} verified jobs but only ${distinctCustomers} distinct customer(s)`,
    });
  }

  if (fastConfirms >= 3) {
    signals.push({
      code: "fast_confirmations",
      points: 20,
      detail: `${fastConfirms} jobs were confirmed within 2 minutes of being created`,
    });
  }

  if (maxIn24h >= 5) {
    signals.push({
      code: "burst",
      points: 15,
      detail: `${maxIn24h} verified jobs within a single 24-hour window`,
    });
  }

  const score = Math.min(signals.reduce((sum, s) => sum + s.points, 0), 100);
  return { score, signals, flagged: score >= FLAG_THRESHOLD };
};

// Largest number of verified receipts inside any rolling 24h window
const maxInWindow = (times) => {
  const sorted = [...times].sort((a, b) => a - b);
  let best = 0;
  let start = 0;
  for (let end = 0; end < sorted.length; end++) {
    while (sorted[end] - sorted[start] > DAY_MS) start++;
    best = Math.max(best, end - start + 1);
  }
  return best;
};

export const assessWorkerRisk = async (workerId) => {
  try {
    const id = new mongoose.Types.ObjectId(String(workerId));
    const worker = await Worker.findById(id).select("riskReviewed riskFlagged scoreFrozen");
    if (!worker) return null;

    const receipts = await JobReceipt.find({ worker: id, status: RECEIPT_STATUS.VERIFIED })
      .select("customerPhone createdAt verifiedAt")
      .lean();

    const perCustomer = {};
    let fastConfirms = 0;
    const times = [];
    for (const r of receipts) {
      perCustomer[r.customerPhone] = (perCustomer[r.customerPhone] || 0) + 1;
      if (r.verifiedAt) {
        times.push(r.verifiedAt.getTime());
        if (r.verifiedAt - r.createdAt < 2 * 60 * 1000) fastConfirms++;
      }
    }

    const counts = Object.values(perCustomer);
    const result = calculateRisk({
      verified: receipts.length,
      distinctCustomers: counts.length,
      topCustomerJobs: counts.length ? Math.max(...counts) : 0,
      fastConfirms,
      maxIn24h: maxInWindow(times),
    });

    // An admin who cleared this worker stays cleared; we still store fresh numbers
    const flagged = result.flagged && !worker.riskReviewed;

    await Worker.updateOne(
      { _id: id },
      {
        riskScore: result.score,
        riskSignals: result.signals,
        riskFlagged: flagged,
        riskCheckedAt: new Date(),
      }
    );

    return { ...result, flagged };
  } catch (err) {
    console.warn("Risk assessment failed:", err.message); // never break a verification
    return null;
  }
};