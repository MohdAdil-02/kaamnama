import mongoose from "mongoose";
import { TIERS } from "../constants/tiers.js";

const workerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    bio: { type: String, trim: true, maxlength: 500 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    skills: [{ type: String, trim: true, maxlength: 50 }],
    experienceYears: { type: Number, min: 0, max: 60, default: 0 },
    city: { type: String, trim: true, index: true },
    area: { type: String, trim: true },
    serviceRadiusKm: { type: Number, min: 0, max: 200, default: 10 },
    location: {
      type: { type: String, enum: ["Point"] },   // no default: only set with coordinates
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
    },
    languages: [{ type: String, trim: true }],
    photoUrl: String,
    isAvailable: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },
    slug: { type: String, unique: true, sparse: true, index: true }, // public profile URL
    publicId: { type: String, unique: true, sparse: true },          // short shareable ID

    // Denormalized for fast directory queries (source of truth: TrustScore)
    tier: { type: String, enum: Object.values(TIERS), default: TIERS.NEW, index: true },
    trustScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    verifiedJobsCount: { type: Number, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    repeatCustomersCount: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
    riskFlagged: { type: Boolean, default: false, index: true },
    riskReviewed: { type: Boolean, default: false }, // admin cleared it
    scoreFrozen: { type: Boolean, default: false },
    riskSignals: [{ _id: false, code: String, points: Number, detail: String }],
    riskCheckedAt: Date,
  },
  { timestamps: true }
);

workerSchema.index({ location: "2dsphere" });
workerSchema.index({ categories: 1, city: 1, trustScore: -1 });
workerSchema.index({ isPublic: 1, city: 1, trustScore: -1 });

export default mongoose.model("Worker", workerSchema);
