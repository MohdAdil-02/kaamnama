import User from "../models/User.js";
import Worker from "../models/Worker.js";
import JobReceipt from "../models/JobReceipt.js";
import Rating from "../models/Rating.js";
import Organization from "../models/Organization.js";
import AuditLog from "../models/AuditLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUS, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { recomputeTrustScore } from "../services/trustScore.service.js";
import { notify } from "../services/notification.service.js";
import { logAction } from "../services/audit.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
const countBy = (Model, field, match = {}) =>
  Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }]);

const paged = async (res, Model, filter, { select, populate = [], sort, key }, query) => {
  const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 100 });
  let q = Model.find(filter).select(select).sort(sort).skip(skip).limit(limit);
  for (const p of populate) q = q.populate(...p);
  const [items, total] = await Promise.all([q.lean(), Model.countDocuments(filter)]);
  res.json({ success: true, data: { [key]: items }, meta: buildPaginationMeta({ total, page, limit }) });
};

// ---------- Dashboard ----------
export const stats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * DAY_MS);

  const [
    usersByRole, usersByStatus, receiptsByStatus, tiers,
    ratingsTotal, ratingsHidden, orgsTotal, orgsUnverified,
    newUsers7d, receipts7d,
  ] = await Promise.all([
    countBy(User, "role"),
    countBy(User, "status"),
    countBy(JobReceipt, "status"),
    countBy(Worker, "tier"),
    Rating.countDocuments(),
    Rating.countDocuments({ isHidden: true }),
    Organization.countDocuments({ isActive: true }),
    Organization.countDocuments({ isActive: true, isVerified: false }),
    User.countDocuments({ createdAt: { $gte: since } }),
    JobReceipt.countDocuments({ createdAt: { $gte: since } }),
  ]);

  res.json({
    success: true,
    data: {
      users: { byRole: toMap(usersByRole), byStatus: toMap(usersByStatus), newLast7Days: newUsers7d },
      receipts: { byStatus: toMap(receiptsByStatus), createdLast7Days: receipts7d },
      workers: { byTier: toMap(tiers) },
      ratings: { total: ratingsTotal, hidden: ratingsHidden },
      organizations: { total: orgsTotal, awaitingVerification: orgsUnverified },
    },
  });
});

// ---------- Users ----------
export const listUsers = asyncHandler(async (req, res) => {
  const { role, status, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { phone: rx }];
  }
  await paged(
    res, User, filter,
    { select: "phone name role status city isPhoneVerified lastLoginAt createdAt", sort: { createdAt: -1 }, key: "users" },
    req.query
  );
});

export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound("User not found");
  if (user._id.equals(req.user._id)) throw AppError.badRequest("You cannot suspend yourself");
  if (user.role === ROLES.ADMIN) throw AppError.forbidden("Admin accounts cannot be suspended here");
  if (user.status === ACCOUNT_STATUS.SUSPENDED) throw AppError.conflict("User is already suspended");

  const before = { status: user.status };
  // Revoke every session; protect() also re-checks status on each request
  await User.updateOne(
    { _id: user._id },
    { $set: { status: ACCOUNT_STATUS.SUSPENDED, refreshTokens: [] } }
  );

  await logAction(req, "user.suspend", {
    targetType: "User",
    targetId: user._id,
    before,
    after: { status: ACCOUNT_STATUS.SUSPENDED, reason: req.body.reason },
  });

  res.json({ success: true, message: "User suspended" });
});

export const reactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound("User not found");
  if (user.status !== ACCOUNT_STATUS.SUSPENDED) throw AppError.badRequest("User is not suspended");

  await User.updateOne({ _id: user._id }, { status: ACCOUNT_STATUS.ACTIVE });
  await logAction(req, "user.reactivate", {
    targetType: "User",
    targetId: user._id,
    before: { status: ACCOUNT_STATUS.SUSPENDED },
    after: { status: ACCOUNT_STATUS.ACTIVE },
  });

  res.json({ success: true, message: "User reactivated" });
});

// ---------- Ratings ----------
export const listRatings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.hidden !== undefined) filter.isHidden = req.query.hidden;
  await paged(
    res, Rating, filter,
    {
      select: "stars punctuality quality behaviour comment isHidden hiddenReason hiddenAt createdAt worker customerUser",
      populate: [["worker", "displayName publicId slug"], ["customerUser", "name phone"]],
      sort: { createdAt: -1 },
      key: "ratings",
    },
    req.query
  );
});

const setRatingHidden = async (req, hidden) => {
  const rating = await Rating.findById(req.params.id);
  if (!rating) throw AppError.notFound("Rating not found");
  if (rating.isHidden === hidden) {
    throw AppError.conflict(hidden ? "Rating is already hidden" : "Rating is not hidden");
  }

  rating.isHidden = hidden;
  rating.hiddenReason = hidden ? req.body.reason : undefined;
  rating.hiddenBy = hidden ? req.user._id : undefined;
  rating.hiddenAt = hidden ? new Date() : undefined;
  await rating.save();

  // Hidden ratings are excluded from the score, so recompute right away
  const trust = await recomputeTrustScore(rating.worker);

  await logAction(req, hidden ? "rating.hide" : "rating.unhide", {
    targetType: "Rating",
    targetId: rating._id,
    before: { isHidden: !hidden },
    after: { isHidden: hidden, reason: req.body?.reason },
  });

  return trust;
};

export const hideRating = asyncHandler(async (req, res) => {
  const trust = await setRatingHidden(req, true);
  res.json({ success: true, message: "Rating hidden", data: { workerTrust: trust && { score: trust.score, tier: trust.tier } } });
});

export const unhideRating = asyncHandler(async (req, res) => {
  const trust = await setRatingHidden(req, false);
  res.json({ success: true, message: "Rating restored", data: { workerTrust: trust && { score: trust.score, tier: trust.tier } } });
});

// ---------- Organizations ----------
export const listOrgs = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.verified !== undefined) filter.isVerified = req.query.verified;
  await paged(
    res, Organization, filter,
    {
      select: "name slug city phone email isVerified createdAt owner",
      populate: [["owner", "name phone"]],
      sort: { createdAt: -1 },
      key: "organizations",
    },
    req.query
  );
});

const setOrgVerified = async (req, verified) => {
  const org = await Organization.findOne({ _id: req.params.id, isActive: true });
  if (!org) throw AppError.notFound("Organization not found");
  if (org.isVerified === verified) {
    throw AppError.conflict(verified ? "Already verified" : "Not verified");
  }

  org.isVerified = verified;
  await org.save();

  await logAction(req, verified ? "organization.verify" : "organization.unverify", {
    targetType: "Organization",
    targetId: org._id,
    before: { isVerified: !verified },
    after: { isVerified: verified },
  });

  if (verified) {
    await notify(org.owner, {
      type: NOTIFICATION_TYPE.SYSTEM,
      title: "Organization verified",
      body: `${org.name} now has the verified badge`,
      data: { organizationId: org._id },
    });
  }
};

export const verifyOrg = asyncHandler(async (req, res) => {
  await setOrgVerified(req, true);
  res.json({ success: true, message: "Organization verified" });
});

export const unverifyOrg = asyncHandler(async (req, res) => {
  await setOrgVerified(req, false);
  res.json({ success: true, message: "Verification removed" });
});

// ---------- Receipts (mainly for reviewing disputes) ----------
export const listReceipts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  await paged(
    res, JobReceipt, filter,
    {
      select: "receiptNumber title amount status workDate customerPhone customerName disputeReason createdAt worker category",
      populate: [["worker", "displayName publicId slug"], ["category", "name slug"]],
      sort: { createdAt: -1 },
      key: "receipts",
    },
    req.query
  );
});

// ---------- Audit log ----------
export const listAuditLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.targetType) filter.targetType = req.query.targetType;
  await paged(
    res, AuditLog, filter,
    {
      select: "action targetType targetId before after ip createdAt actor",
      populate: [["actor", "name phone"]],
      sort: { createdAt: -1 },
      key: "logs",
    },
    req.query
  );
});