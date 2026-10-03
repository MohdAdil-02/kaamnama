import mongoose from "mongoose";
import { RECEIPT_STATUS, VERIFICATION_METHOD } from "../constants/statuses.js";

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true }, // e.g. KN-20260929-A1B2C3
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    workerUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Customer may not have an account yet, so we key by phone
    customerPhone: { type: String, required: true, index: true },
    customerName: { type: String, trim: true, maxlength: 100 },
    customerUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    amount: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: "INR" },
    workDate: { type: Date, required: true },
    address: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true },
    photos: [{ url: String, publicId: String }],

    status: {
      type: String,
      enum: Object.values(RECEIPT_STATUS),
      default: RECEIPT_STATUS.PENDING,
      index: true,
    },
    verificationMethod: { type: String, enum: Object.values(VERIFICATION_METHOD) },
    verifiedAt: Date,
        disputeReason: { type: String, trim: true, maxlength: 500 },
    disputedAfterVerification: { type: Boolean, default: false },
    disputedAt: Date,
    expiresAt: { type: Date, index: true }, // pending receipts expire

    // Token for QR / link verification (stored hashed)
    verifyTokenHash: { type: String, select: false, index: true },
    isRepeatCustomer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

receiptSchema.index({ worker: 1, status: 1, workDate: -1 });
receiptSchema.index({ worker: 1, customerPhone: 1 });

export default mongoose.model("JobReceipt", receiptSchema);