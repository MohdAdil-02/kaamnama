import mongoose from "mongoose";
import { VERIFICATION_METHOD } from "../constants/statuses.js";

// Audit trail of everything that happens to a receipt's verification
const verificationEventSchema = new mongoose.Schema(
  {
    receipt: { type: mongoose.Schema.Types.ObjectId, ref: "JobReceipt", required: true, index: true },
    type: {
      type: String,
      enum: ["created", "otp_sent", "otp_failed", "verified", "disputed", "rejected", "expired", "resent"],
      required: true,
    },
    method: { type: String, enum: Object.values(VERIFICATION_METHOD) },
    actorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorPhone: String,
    ip: String,
    userAgent: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("VerificationEvent", verificationEventSchema);