import mongoose from "mongoose";
import JobReceipt from "../models/JobReceipt.js";
import Rating from "../models/Rating.js";
import Worker from "../models/Worker.js";
import TrustScore from "../models/TrustScore.js";
import { RECEIPT_STATUS, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { TIER_RULES, getTierForStats } from "../constants/tiers.js";
import { recomputeRepeatCustomers } from "./repeatCustomer.service.js";
import { notify } from "./notification.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const round1 = (n) => Math.round(n * 10) / 10;

const PRIOR_RATING = 3.5;
const PRIOR_WEIGHT = 3;

export const calculateScore = ({
  verifiedJobs,
  ratingsCount,
  ratingsSum,
  repeatCustomers,
  disputedOrRejected,
  processed,
  accountAgeDays,
}) => {
  const jobsPts = 35 * Math.sqrt(clamp(verifiedJobs, 0, 75) / 75);

  let ratingPts = 0;
  if (ratingsCount > 0) {
    const adjustedRating = (ratingsSum + PRIOR_RATING * PRIOR_WEIGHT) / (ratingsCount + PRIOR_WEIGHT);
    ratingPts = 30 * clamp((adjustedRating - 2) / 3, 0, 1);
  }

  const repeatPts = 15 * (clamp(repeatCustomers, 0, 5) / 5);

  const disputeRate = processed > 0 ? disputedOrRejected / processed : 0;
  const reliabilityPts = processed > 0 ? 10 * (1 - disputeRate) : 0;

  const agePts = 10 * (clamp(accountAgeDays, 0, 180) / 180);

  const score = clamp(Math.round(jobsPts + ratingPts + repeatPts + reliabilityPts + agePts), 0, 100);
  return {
    score,
    disputeRate,
    parts: {
      jobs: round1(jobsPts),
      ratings: round1(ratingPts),
      repeat: round1(repeatPts),
      reliability: round1(reliabilityPts),
      age: round1(agePts),
    },
  };
};

const tierIndex = (tier) => TIER_RULES.findIndex((r) => r.tier === tier);

const nextTierInfo = (currentTier, score, verifiedJobs) => {
  const next = TIER_RULES[tierIndex(currentTier) + 1];
  if (!next) return null;
  return {
    tier: next.tier,
    needsScore: next.minScore,
    needsVerifiedJobs: next.minVerifiedJobs,
    scoreGap: Math.max(next.minScore - score, 0),
    jobsGap: Math.max(next.minVerifiedJobs - verifiedJobs, 0),
  };
};

/**
 * Recomputes everything from source data, then saves to TrustScore
 * and the denormalized fields on Worker. Safe to call any time.
 */
export const recomputeTrustScore = async (workerId) => {
  const id = new mongoose.Types.ObjectId(String(workerId));
  const worker = await Worker.findById(id).select("createdAt tier user");
  if (!worker) return null;

  const [statusRows, ratingRows, repeatCustomers] = await Promise.all([
    JobReceipt.aggregate([
      { $match: { worker: id } },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ]),
    Rating.aggregate([
      { $match: { worker: id, isHidden: false } },
      { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: "$stars" } } },
    ]),
    recomputeRepeatCustomers(id),
  ]);

  const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.n]));
  const verifiedJobs = byStatus[RECEIPT_STATUS.VERIFIED] || 0;
  const disputedOrRejected =
    (byStatus[RECEIPT_STATUS.DISPUTED] || 0) + (byStatus[RECEIPT_STATUS.REJECTED] || 0);
  const processed = verifiedJobs + disputedOrRejected;

  const ratingsCount = ratingRows[0]?.count || 0;
  const ratingsSum = ratingRows[0]?.sum || 0;
  const averageRating = ratingsCount ? round1(ratingsSum / ratingsCount) : 0;
  const accountAgeDays = Math.floor((Date.now() - worker.createdAt.getTime()) / DAY_MS);

  const { score, disputeRate, parts } = calculateScore({
    verifiedJobs,
    ratingsCount,
    ratingsSum,
    repeatCustomers,
    disputedOrRejected,
    processed,
    accountAgeDays,
  });

  const tier = getTierForStats(score, verifiedJobs);
  const previousTier = worker.tier;
  const upgraded = tierIndex(tier) > tierIndex(previousTier);

  await TrustScore.findOneAndUpdate(
    { worker: id },
    {
      score,
      tier,
      breakdown: {
        verifiedJobs,
        averageRating,
        repeatCustomers,
        disputeRate: Math.round(disputeRate * 1000) / 1000,
        accountAgeDays,
      },
      lastCalculatedAt: new Date(),
    },
    { upsert: true, returnDocument: "after" }
  );

  await Worker.updateOne(
    { _id: id },
    {
      tier,
      trustScore: score,
      verifiedJobsCount: verifiedJobs,
      averageRating,
      ratingsCount,
      repeatCustomersCount: repeatCustomers,
    }
  );

  if (upgraded) {
    await notify(worker.user, {
      type: NOTIFICATION_TYPE.TIER_UPGRADED,
      title: "You reached a new tier",
      body: `Congratulations! You are now ${tier.toUpperCase()}.`,
      data: { tier, previousTier },
    });
  }

  return {
    score,
    tier,
    previousTier,
    upgraded,
    parts,
    breakdown: { verifiedJobs, averageRating, ratingsCount, repeatCustomers, disputedOrRejected, accountAgeDays },
    nextTier: nextTierInfo(tier, score, verifiedJobs),
  };
};