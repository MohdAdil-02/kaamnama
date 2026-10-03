import JobReceipt from "../models/JobReceipt.js";
import User from "../models/User.js";
import VerificationEvent from "../models/VerificationEvent.js";
import AppError from "../utils/AppError.js";
import { RECEIPT_STATUS, OTP_PURPOSE, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { sha256 } from "../utils/hash.js";
import { maskPhone } from "../utils/phone.js";
import * as otpService from "./otp.service.js";
import { refreshRepeatStatus } from "./repeatCustomer.service.js";
import { recomputeTrustScore } from "./trustScore.service.js";
import { notify } from "./notification.service.js";

const MAX_OTP_SENDS_PER_RECEIPT = 5;

const logEvent = (receiptId, type, meta = {}, extra = {}) =>
  VerificationEvent.create({
    receipt: receiptId,
    type,
    ip: meta.ip,
    userAgent: meta.userAgent,
    ...extra,
  });

const findByToken = async (token) => {
  const receipt = await JobReceipt.findOne({ verifyTokenHash: sha256(token) })
    .populate("worker", "displayName photoUrl publicId slug tier city")
    .populate("category", "name slug");

  if (!receipt) throw AppError.notFound("This verification link is invalid or no longer active");

  if (receipt.status === RECEIPT_STATUS.PENDING && receipt.expiresAt && receipt.expiresAt < new Date()) {
    await JobReceipt.updateOne(
      { _id: receipt._id, status: RECEIPT_STATUS.PENDING },
      { status: RECEIPT_STATUS.EXPIRED, $unset: { verifyTokenHash: 1 } }
    );
    await logEvent(receipt._id, "expired");
    throw AppError.badRequest("This verification link has expired");
  }

  return receipt;
};

const requirePending = (receipt) => {
  if (receipt.status !== RECEIPT_STATUS.PENDING) {
    throw AppError.badRequest(`This receipt is already ${receipt.status}`);
  }
};

export const getPreview = async (token) => {
  const r = await findByToken(token);
  return {
    receiptNumber: r.receiptNumber,
    status: r.status,
    title: r.title,
    description: r.description,
    amount: r.amount,
    currency: r.currency,
    workDate: r.workDate,
    category: r.category,
    photos: r.photos.map((p) => p.url),
    customerPhoneMasked: maskPhone(r.customerPhone),
    expiresAt: r.expiresAt,
    worker: {
      displayName: r.worker.displayName,
      photoUrl: r.worker.photoUrl,
      publicId: r.worker.publicId,
      slug: r.worker.slug,
      tier: r.worker.tier,
      city: r.worker.city,
    },
  };
};

export const sendVerificationOtp = async (token, meta) => {
  const receipt = await findByToken(token);
  requirePending(receipt);

  const sends = await VerificationEvent.countDocuments({ receipt: receipt._id, type: "otp_sent" });
  if (sends >= MAX_OTP_SENDS_PER_RECEIPT) {
    throw AppError.tooMany("OTP limit reached for this receipt");
  }

  const result = await otpService.sendOtp({
    phone: receipt.customerPhone,
    purpose: OTP_PURPOSE.RECEIPT_VERIFY,
    reference: receipt._id,
    buildMessage: (code, ttl) =>
      `${code} is your Kaamnama code to confirm the job "${receipt.title}" by ${receipt.worker.displayName}. ` +
      `Valid ${ttl} min. Share it only if this work was done for you.`,
  });

  await logEvent(receipt._id, "otp_sent", meta, { actorPhone: receipt.customerPhone });
  return { sentTo: maskPhone(receipt.customerPhone), ...result };
};

const ACTIONS = {
  verify: { status: RECEIPT_STATUS.VERIFIED, event: "verified" },
  dispute: { status: RECEIPT_STATUS.DISPUTED, event: "disputed" },
  reject: { status: RECEIPT_STATUS.REJECTED, event: "rejected" },
};

const WORKER_NOTICE = {
  verify: { type: NOTIFICATION_TYPE.RECEIPT_VERIFIED, title: "Job verified", text: "Your customer confirmed" },
  dispute: { type: NOTIFICATION_TYPE.RECEIPT_DISPUTED, title: "Job disputed", text: "Your customer raised an issue with" },
  reject: { type: NOTIFICATION_TYPE.RECEIPT_REJECTED, title: "Job rejected", text: "Your customer rejected" },
};

export const confirmReceipt = async (token, { otp, action, reason, channel }, meta) => {
  const receipt = await findByToken(token);
  requirePending(receipt);

  try {
    await otpService.verifyOtp({
      phone: receipt.customerPhone,
      code: otp,
      purposes: OTP_PURPOSE.RECEIPT_VERIFY,
      reference: receipt._id,
    });
  } catch (err) {
    await logEvent(receipt._id, "otp_failed", meta, { actorPhone: receipt.customerPhone });
    throw err;
  }

  const { status, event } = ACTIONS[action];
  const set = { status, verificationMethod: channel };
  if (action === "verify") set.verifiedAt = new Date();
  if (reason) set.disputeReason = reason;

  const customerUser = await User.findOne({ phone: receipt.customerPhone }).select("_id");
  if (customerUser) set.customerUser = customerUser._id;

  // Atomic: only one request can move the receipt out of "pending"
  const updated = await JobReceipt.findOneAndUpdate(
    { _id: receipt._id, status: RECEIPT_STATUS.PENDING },
    { $set: set, $unset: { verifyTokenHash: 1 } },
    { returnDocument: "after" }
  );
  if (!updated) throw AppError.conflict("This receipt was already processed");

  if (action === "verify") {
    await refreshRepeatStatus(receipt.worker._id, receipt.customerPhone);
  }
  // Disputes and rejections affect the score too, so recompute for every outcome
  await recomputeTrustScore(receipt.worker._id);

  const notice = WORKER_NOTICE[action];
  await notify(receipt.workerUser, {
    type: notice.type,
    title: notice.title,
    body: `${notice.text} "${receipt.title}"`,
    data: { receiptId: receipt._id },
  });

  await logEvent(receipt._id, event, meta, {
    method: channel,
    actorPhone: receipt.customerPhone,
    actorUser: customerUser ? customerUser._id : undefined,
    meta: reason ? { reason } : undefined,
  });

  return {
    receiptNumber: updated.receiptNumber,
    status: updated.status,
    message:
      action === "verify"
        ? "Thank you! The job has been verified"
        : action === "dispute"
        ? "Your dispute has been recorded"
        : "The receipt has been rejected",
  };
};