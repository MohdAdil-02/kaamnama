import mongoose from "mongoose";
import { OTP_PURPOSE } from "../constants/statuses.js";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    purpose: { type: String, enum: Object.values(OTP_PURPOSE), required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
    // Optional link, e.g. the receipt being verified
    reference: { type: mongoose.Schema.Types.ObjectId },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB auto-deletes documents after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

export default mongoose.model("OTP", otpSchema);