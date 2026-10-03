import asyncHandler from "../utils/asyncHandler.js";
import * as profileService from "../services/profile.service.js";
import { recomputeTrustScore } from "../services/trustScore.service.js";

export const getTrust = asyncHandler(async (req, res) => {
  const worker = await profileService.loadWorker(req.user._id);
  const trust = await recomputeTrustScore(worker._id);
  res.json({ success: true, data: { trust } });
});

export const getMe = asyncHandler(async (req, res) => {
  const worker = await profileService.getMyProfile(req.user._id);
  res.json({ success: true, data: { worker } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const worker = await profileService.updateMyProfile(req.user._id, req.body);
  res.json({ success: true, message: "Profile updated", data: { worker } });
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  const data = await profileService.updatePhoto(req.user._id, req.file);
  res.json({ success: true, message: "Photo updated", data });
});

export const removePhoto = asyncHandler(async (req, res) => {
  await profileService.removePhoto(req.user._id);
  res.json({ success: true, message: "Photo removed" });
});