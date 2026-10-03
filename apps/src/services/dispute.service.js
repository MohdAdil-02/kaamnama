import JobReceipt from "../models/JobReceipt.js";
import Rating from "../models/Rating.js";
import VerificationEvent from "../models/VerificationEvent.js";
import AppError from "../utils/AppError.js";
import { RECEIPT_STATUS, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { recomputeTrustScore } from "./trustScore.service.js";
import { notify } from "./notification.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;
export const DISPUTE_WINDOW_DAYS = 30;

export const disputeVerifiedReceipt = async (user, receiptId, reason, meta = {}) => {
  // Must be the customer named on the receipt (matched by phone)
  const receipt = await JobReceipt.findOne({ _id: receiptId, customerPhone: user.phone });
  if (!receipt) throw AppError.notFound("Receipt not found");

  if (receipt.status === RECEIPT_STATUS.DISPUTED) {
    throw AppError.conflict("This job has already been disputed");
  }
  if (receipt.status !== RECEIPT_STATUS.VERIFIED) {
    throw AppError.badRequest(
      `Only verified jobs can be disputed here (this one is ${receipt.status})`
    );
  }

  const cutoff = new Date(Date.now() - DISPUTE_WINDOW_DAYS * DAY_MS);

  // Atomic: only one request can move it from verified to disputed
  const updated = await JobReceipt.findOneAndUpdate(
    { _id: receipt._id, status: RECEIPT_STATUS.VERIFIED, verifiedAt: { $gte: cutoff } },
    {
      $set: {
        status: RECEIPT_STATUS.DISPUTED,
        disputeReason: reason,
        disputedAfterVerification: true,
        disputedAt: new Date(),
        isRepeatCustomer: false,
      },
    },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw AppError.badRequest(
      `This job can no longer be disputed (the ${DISPUTE_WINDOW_DAYS}-day window has passed)`
    );
  }

  // If this pair no longer has 2+ verified jobs, clear the stale "repeat" flag
  const stillVerified = await JobReceipt.countDocuments({
    worker: receipt.worker,
    customerPhone: receipt.customerPhone,
    status: RECEIPT_STATUS.VERIFIED,
  });
  if (stillVerified < 2) {
    await JobReceipt.updateMany(
      { worker: receipt.worker, customerPhone: receipt.customerPhone, status: RECEIPT_STATUS.VERIFIED },
      { $set: { isRepeatCustomer: false } }
    );
  }

  // A disputed job should not keep boosting the worker's rating
  await Rating.updateOne(
    { receipt: receipt._id, isHidden: false },
    {
      $set: {
        isHidden: true,
        hiddenReason: "Job disputed by customer",
        hiddenBy: user._id,
        hiddenAt: new Date(),
      },
    }
  );

  await VerificationEvent.create({
    receipt: receipt._id,
    type: "disputed",
    method: receipt.verificationMethod,
    actorUser: user._id,
    actorPhone: user.phone,
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { afterVerification: true, reason },
  });

  await recomputeTrustScore(receipt.worker);

  await notify(receipt.workerUser, {
    type: NOTIFICATION_TYPE.RECEIPT_DISPUTED,
    title: "Job disputed",
    body: `Your customer disputed "${receipt.title}" after confirming it`,
    data: { receiptId: receipt._id },
  });

  return { receiptNumber: updated.receiptNumber, status: updated.status };
};