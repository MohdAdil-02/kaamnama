import User from "../models/User.js";
import Worker from "../models/Worker.js";
import JobReceipt from "../models/JobReceipt.js";
import Rating from "../models/Rating.js";
import Notification from "../models/Notification.js";
import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";
import OTP from "../models/OTP.js";
import VerificationEvent from "../models/VerificationEvent.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUS, OTP_PURPOSE, RECEIPT_STATUS } from "../constants/statuses.js";
import * as otpService from "./otp.service.js";
import { deleteImage } from "./upload.service.js";

export const sendDeleteOtp = (user) => {
  if (user.role === ROLES.ADMIN) {
    throw AppError.forbidden("Admin accounts cannot be deleted here");
  }
  return otpService.sendOtp({
    phone: user.phone,
    purpose: OTP_PURPOSE.ACCOUNT_DELETE,
    template: "delete_otp",
  });
};

// Pending receipts can never be confirmed once either party is gone
const expirePending = async (filter) => {
  const pending = await JobReceipt.find({ ...filter, status: RECEIPT_STATUS.PENDING })
    .select("_id photos")
    .lean();
  for (const r of pending) {
    for (const p of r.photos || []) await deleteImage(p.publicId);
  }
  await JobReceipt.updateMany(
    { _id: { $in: pending.map((r) => r._id) }, status: RECEIPT_STATUS.PENDING },
    { $set: { status: RECEIPT_STATUS.EXPIRED, photos: [] }, $unset: { verifyTokenHash: 1 } }
  );
};

const scrubWorker = async (user) => {
  const worker = await Worker.findOne({ user: user._id });
  if (!worker) return;

  await expirePending({ workerUser: user._id });
  await deleteImage(worker.photoPublicId);

  await Worker.updateOne(
    { _id: worker._id },
    {
      $set: {
        displayName: "Deleted worker",
        isPublic: false,
        isAvailable: false,
        skills: [],
        languages: [],
        riskFlagged: false,
      },
      $unset: {
        bio: 1, photoUrl: 1, photoPublicId: 1, slug: 1, publicId: 1,
        area: 1, location: 1, city: 1,
      },
    }
  );

  await OrganizationMembership.updateMany({ user: user._id }, { status: "removed" });
};

const scrubOrganizations = async (user) => {
  const orgs = await Organization.find({ owner: user._id }).select("_id").lean();
  if (!orgs.length) return;
  const ids = orgs.map((o) => o._id);
  await Organization.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: false }, $unset: { phone: 1, email: 1 } }
  );
  await OrganizationMembership.updateMany({ organization: { $in: ids } }, { status: "removed" });
};

const scrubAsCustomer = async (user) => {
  const phone = user.phone;
  const replacement = `deleted:${user._id}`;

  await expirePending({ customerPhone: phone });
  await JobReceipt.updateMany(
    { customerPhone: phone },
    { $set: { customerPhone: replacement }, $unset: { customerName: 1 } }
  );
  await VerificationEvent.updateMany(
    { actorPhone: phone },
    { $unset: { actorPhone: 1, ip: 1, userAgent: 1 } }
  );
  await Rating.updateMany({ customerUser: user._id }, { $unset: { comment: 1 } });
};

export const deleteAccount = async (user, otp) => {
  if (user.role === ROLES.ADMIN) {
    throw AppError.forbidden("Admin accounts cannot be deleted here");
  }

  await otpService.verifyOtp({
    phone: user.phone,
    code: otp,
    purposes: OTP_PURPOSE.ACCOUNT_DELETE,
  });

  // Order matters: customer scrub reads the real phone, so it runs before the User is changed.
  // Every step is safe to repeat, so a failed attempt can simply be retried with a new OTP.
  if (user.role === ROLES.WORKER) await scrubWorker(user);
  if (user.role === ROLES.ORG_ADMIN) await scrubOrganizations(user);
  await scrubAsCustomer(user); // a worker's number can also appear as a customer

  await OTP.deleteMany({ phone: user.phone });
  await Notification.deleteMany({ user: user._id });

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        status: ACCOUNT_STATUS.DELETED,
        phone: `deleted:${user._id}`,
        name: "Deleted user",
        isPhoneVerified: false,
        refreshTokens: [],
      },
      $unset: { email: 1, avatarUrl: 1, city: 1, lastLoginAt: 1 },
    }
  );
};

export const exportMyData = async (user) => {
  const worker = await Worker.findOne({ user: user._id }).lean();

  const [account, receiptsAsWorker, receiptsAsCustomer, ratingsGiven, ratingsReceived, notifications, memberships, orgs] =
    await Promise.all([
      User.findById(user._id).lean(),
      JobReceipt.find({ workerUser: user._id }).select("-verifyTokenHash").limit(1000).lean(),
      JobReceipt.find({ customerPhone: user.phone }).select("-verifyTokenHash -workerUser").limit(1000).lean(),
      Rating.find({ customerUser: user._id }).select("-hiddenBy").limit(1000).lean(),
      worker ? Rating.find({ worker: worker._id }).select("-hiddenBy").limit(1000).lean() : [],
      Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(500).lean(),
      OrganizationMembership.find({ user: user._id }).lean(),
      Organization.find({ owner: user._id }).lean(),
    ]);

  delete account.__v;
  delete account.refreshTokens;

  return {
    exportedAt: new Date().toISOString(),
    account,
    workerProfile: worker || null,
    receiptsAsWorker,
    receiptsAsCustomer,
    ratingsGiven,
    ratingsReceived,
    notifications,
    organizationMemberships: memberships,
    organizationsOwned: orgs,
  };
};