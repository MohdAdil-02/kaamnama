import asyncHandler from "../utils/asyncHandler.js";
import * as orgService from "../services/organization.service.js";

export const create = asyncHandler(async (req, res) => {
  const organization = await orgService.createOrg(req.user, req.body);
  res.status(201).json({ success: true, message: "Organization created", data: { organization } });
});

export const mine = asyncHandler(async (req, res) => {
  const organizations = await orgService.listMyOrgs(req.user._id);
  res.json({ success: true, data: { organizations } });
});

export const update = asyncHandler(async (req, res) => {
  const organization = await orgService.updateOrg(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: "Organization updated", data: { organization } });
});

export const invite = asyncHandler(async (req, res) => {
  const membership = await orgService.inviteWorker(req.user, req.params.id, req.body.phone);
  res.status(201).json({ success: true, message: "Invite sent", data: { membership } });
});

export const members = asyncHandler(async (req, res) => {
  const list = await orgService.listMembers(req.user._id, req.params.id);
  res.json({ success: true, data: { members: list } });
});

export const removeMember = asyncHandler(async (req, res) => {
  await orgService.removeMember(req.user._id, req.params.id, req.params.memberId);
  res.json({ success: true, message: "Member removed" });
});

export const myInvites = asyncHandler(async (req, res) => {
  const invites = await orgService.listMyInvites(req.user._id);
  res.json({ success: true, data: { invites } });
});

export const accept = asyncHandler(async (req, res) => {
  const membership = await orgService.acceptInvite(req.user._id, req.params.memberId);
  res.json({ success: true, message: "You joined the organization", data: { membership } });
});

export const decline = asyncHandler(async (req, res) => {
  await orgService.declineInvite(req.user._id, req.params.memberId);
  res.json({ success: true, message: "Invite declined" });
});

export const leave = asyncHandler(async (req, res) => {
  await orgService.leaveOrg(req.user._id, req.params.orgId);
  res.json({ success: true, message: "You left the organization" });
});

export const publicProfile = asyncHandler(async (req, res) => {
  const data = await orgService.getPublicOrg(req.params.slug);
  res.json({ success: true, data });
});