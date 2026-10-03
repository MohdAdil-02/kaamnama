import mongoose from "mongoose";
import { TIERS } from "../constants/tiers.js";

const trustScoreSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, unique: true },
    score: { type: Number, min: 0, max: 100, default: 0 },
    tier: { type: String, enum: Object.values(TIERS), default: TIERS.NEW },
    breakdown: {
      verifiedJobs: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      repeatCustomers: { type: Number, default: 0 },
      disputeRate: { type: Number, default: 0 },
      accountAgeDays: { type: Number, default: 0 },
    },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("TrustScore", trustScoreSchema);
