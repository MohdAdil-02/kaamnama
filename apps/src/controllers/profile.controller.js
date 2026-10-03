import asyncHandler from "../utils/asyncHandler.js";
import * as profileService from "../services/profile.service.js";

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getPublicProfile(req.params.identifier);
  res.json({ success: true, data: { profile } });
});