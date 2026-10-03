import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/environment.js";
import * as authService from "../services/auth.service.js";
import Worker from "../models/Worker.js";
import { ROLES } from "../constants/roles.js";

const COOKIE_NAME = "kn_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth",
};

const meta = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"] });

export const sendOtp = asyncHandler(async (req, res) => {
  const result = await authService.requestOtp(req.body);
  res.json({ success: true, message: "OTP sent", data: result });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { user, isNewUser, accessToken, refreshToken } =
    await authService.verifyOtpAndLogin(req.body, meta(req));

  res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
  res.status(isNewUser ? 201 : 200).json({
    success: true,
    message: isNewUser ? "Account created" : "Logged in",
    data: { user, isNewUser, accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.[COOKIE_NAME];
  const { user, accessToken, refreshToken } = await authService.refreshSession(token, meta(req));

  res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
  res.json({ success: true, data: { user, accessToken, refreshToken } });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.cookies?.[COOKIE_NAME];
  await authService.logout(req.user._id, token);
  res.clearCookie(COOKIE_NAME, { path: cookieOptions.path });
  res.json({ success: true, message: "Logged out" });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user._id);
  res.clearCookie(COOKIE_NAME, { path: cookieOptions.path });
  res.json({ success: true, message: "Logged out from all devices" });
});

export const me = asyncHandler(async (req, res) => {
  const data = { user: req.user };
  if (req.user.role === ROLES.WORKER) {
    data.worker = await Worker.findOne({ user: req.user._id }).populate("categories", "name slug");
  }
  res.json({ success: true, data });
});