import crypto from "crypto";
import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";
import Worker from "../models/Worker.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { ROLES, ORG_MEMBER_ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUS, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { notify } from "./notification.service.js";

const MAX_ORGS_PER_OWNER = 5;
const MAX_MEMBERS = 500;

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "org";

const suffix = () => crypto.randomBytes(3).toString("hex");

const getOwnedOrg = async (userId, orgId) => {
  const org = await Organization.findOne({ _id: orgId, owner: userId, isActive: true });
  if (!org) throw AppError.notFound("Organization not found");
  return org;
};

export const createOrg = async (user, data) => {
  const count = await Organization.countDocuments({ owner: user._id, isActive: true });
  if (count >= MAX_ORGS_PER_OWNER) {
    throw AppError.badRequest(`You can own at most ${MAX_ORGS_PER_OWNER} organizations`);
  }

  let org;
  for (let i = 0; i < 5 && !org; i++) {
    try {
      org = await Organization.create({
        ...data,
        owner: user._id,
        slug: `${slugify(data.name)}-${suffix()}`,
      });
    } catch (err) {
      if (!(err.code === 11000 && err.keyPattern?.slug)) throw err;
    }
  }
  if (!org) throw new AppError("Could not create organization. Please try again", 500);
  return org;
};

export const listMyOrgs = (userId) =>
  Organization.find({ owner: userId, isActive: true }).sort({ createdAt: -1 }).lean();

export const updateOrg = async (userId, orgId, data) => {
  const org = await getOwnedOrg(userId, orgId);
  Object.assign(org, data);
  await org.save();
  return org;
};

export const inviteWorker = async (user, orgId, phone) => {
  const org = await getOwnedOrg(user._id, orgId);

  const target = await User.findOne({ phone, role: ROLES.WORKER, status: ACCOUNT_STATUS.ACTIVE });
  if (!target) {
    // Same message whether the number is unknown or not a worker: no phone enumeration
    throw AppError.notFound("No worker account found for this number");
  }
  const worker = await Worker.findOne({ user: target._id });
  if (!worker) throw AppError.notFound("No worker account found for this number");

  const total = await OrganizationMembership.countDocuments({
    organization: org._id,
    status: { $ne: "removed" },
  });
  if (total >= MAX_MEMBERS) throw AppError.badRequest("Member limit reached");

  const existing = await OrganizationMembership.findOne({ organization: org._id, worker: worker._id });

  let membership;
  if (existing) {
    if (existing.status === "active") throw AppError.conflict("Already a member");
    if (existing.status === "invited") throw AppError.conflict("Invite already sent");
    // removed or declined earlier: re-invite
    existing.status = "invited";
    existing.invitedBy = user._id;
    existing.joinedAt = undefined;
    membership = await existing.save();
  } else {
    membership = await OrganizationMembership.create({
      organization: org._id,
      worker: worker._id,
      user: target._id,
      invitedBy: user._id,
    });
  }

  await notify(target._id, {
    type: NOTIFICATION_TYPE.ORG_INVITE,
    title: "Organization invite",
    body: `${org.name} invited you to join their team`,
    data: { membershipId: membership._id, organizationId: org._id },
  });

  return membership;
};

export const listMembers = async (userId, orgId) => {
  const org = await getOwnedOrg(userId, orgId);
  return OrganizationMembership.find({ organization: org._id, status: { $ne: "removed" } })
    .populate("worker", "displayName photoUrl publicId slug tier trustScore city")
    .sort({ createdAt: -1 })
    .lean();
};

export const removeMember = async (userId, orgId, memberId) => {
  const org = await getOwnedOrg(userId, orgId);
  const membership = await OrganizationMembership.findOneAndUpdate(
    { _id: memberId, organization: org._id, status: { $ne: "removed" } },
    { status: "removed" },
    { returnDocument: "after" }
  );
  if (!membership) throw AppError.notFound("Member not found");
};

// ---------- Worker side ----------
export const listMyInvites = (userId) =>
  OrganizationMembership.find({ user: userId, status: "invited" })
    .populate("organization", "name slug logoUrl city isVerified")
    .sort({ createdAt: -1 })
    .lean();

const respondToInvite = async (userId, memberId, accept) => {
  const membership = await OrganizationMembership.findOneAndUpdate(
    { _id: memberId, user: userId, status: "invited" },
    accept ? { status: "active", joinedAt: new Date() } : { status: "removed" },
    { returnDocument: "after" }
  );
  if (!membership) throw AppError.notFound("Invite not found");
  return membership;
};

export const acceptInvite = (userId, memberId) => respondToInvite(userId, memberId, true);
export const declineInvite = (userId, memberId) => respondToInvite(userId, memberId, false);

export const leaveOrg = async (userId, orgId) => {
  const membership = await OrganizationMembership.findOneAndUpdate(
    { organization: orgId, user: userId, status: "active" },
    { status: "removed" }
  );
  if (!membership) throw AppError.notFound("You are not a member of this organization");
};

// ---------- Public ----------
export const getPublicOrg = async (slug) => {
  const org = await Organization.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("name slug description logoUrl city isVerified createdAt")
    .lean();
  if (!org) throw AppError.notFound("Organization not found");

  const members = await OrganizationMembership.find({ organization: org._id, status: "active" })
    .populate({
      path: "worker",
      match: { isPublic: true },
      select: "displayName photoUrl publicId slug tier trustScore verifiedJobsCount averageRating city",
    })
    .lean();

  const workers = members
    .filter((m) => m.worker)
    .map((m) => ({ role: m.role, joinedAt: m.joinedAt, ...m.worker }))
    .sort((a, b) => b.trustScore - a.trustScore);

  return { organization: org, members: workers, memberCount: workers.length };
};