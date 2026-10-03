import mongoose from "mongoose";
import { NOTIFICATION_TYPE } from "../constants/statuses.js";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    title: { type: String, required: true, maxlength: 150 },
    body: { type: String, maxlength: 500 },
    data: mongoose.Schema.Types.Mixed, // e.g. { receiptId }
    isRead: { type: Boolean, default: false },
    readAt: Date,
    channels: {
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    smsSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
// Auto-clean after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.model("Notification", notificationSchema);