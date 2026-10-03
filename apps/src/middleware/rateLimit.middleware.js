import rateLimit from "express-rate-limit";

const build = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// Applied to every request
export const globalLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: "Too many requests, please try again later",
});

// Login / register / refresh
export const authLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many auth attempts, please try again later",
});

// Sending OTPs (SMS costs money, so keep this tight)
export const otpLimiter = build({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: "Too many OTP requests, please try again in a few minutes",
});

// Public directory / search
export const publicLimiter = build({
  windowMs: 60 * 1000,
  limit: 60,
  message: "Too many requests, slow down",
});