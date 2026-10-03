import JobReceipt from "../models/JobReceipt.js";
import VerificationEvent from "../models/VerificationEvent.js";
import { RECEIPT_STATUS, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { notify } from "../services/notification.service.js";

const BATCH = 500;

export const expireStaleReceipts = async () => {
  const stale = await JobReceipt.find({
    status: RECEIPT_STATUS.PENDING,
    expiresAt: { $lt: new Date() },
  })
    .select("_id workerUser title")
    .limit(BATCH)
    .lean();

  let expired = 0;
  for (const r of stale) {
    // Atomic: skip it if the customer confirmed it a moment ago
    const res = await JobReceipt.updateOne(
      { _id: r._id, status: RECEIPT_STATUS.PENDING },
      { status: RECEIPT_STATUS.EXPIRED, $unset: { verifyTokenHash: 1 } }
    );
    if (!res.modifiedCount) continue;

    expired++;
    await VerificationEvent.create({ receipt: r._id, type: "expired" });
    await notify(r.workerUser, {
      type: NOTIFICATION_TYPE.RECEIPT_EXPIRED,
      title: "Receipt expired",
      body: `"${r.title}" was not confirmed in time. You can create a new receipt.`,
      data: { receiptId: r._id },
    });
  }

  return { found: stale.length, expired };
};