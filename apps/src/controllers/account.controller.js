import asyncHandler from "../utils/asyncHandler.js";
import * as accountService from "../services/account.service.js";
import { logAction } from "../services/audit.service.js";

const COOKIE_NAME = "kn_refresh";

export const sendDeleteOtp = asyncHandler(async (req, res) => {
  const data = await accountService.sendDeleteOtp(req.user);
  res.json({ success: true, message: "OTP sent to confirm deletion", data });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await accountService.deleteAccount(req.user, req.body.otp);

  await logAction(req, "account.delete", { targetType: "User", targetId: userId });

  res.clearCookie(COOKIE_NAME, { path: "/api/v1/auth" });
  res.json({
    success: true,
    message: "Your account has been deleted. Personal details were removed; past job records remain in anonymised form.",
  });
});

export const exportData = asyncHandler(async (req, res) => {
  const data = await accountService.exportMyData(req.user);
  res.setHeader("Content-Disposition", 'attachment; filename="kaamnama-my-data.json"');
  res.json({ success: true, data });
});