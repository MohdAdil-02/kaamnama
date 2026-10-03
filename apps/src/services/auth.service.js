import User from "../models/User.js";
import Worker from "../models/Worker.js";
import AppError from "../utils/AppError.js";
import env from "../config/environment.js";
import { ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUS, OTP_PURPOSE } from "../constants/statuses.js";
import { sha256, generateToken } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import * as otpService from "./otp.service.js";

const MAX_SESSIONS = 5; // per user, oldest is dropped

// Parse "30d" / "15m" style strings into ms (for storing refresh expiry)
const durationToMs = (str) => {
  const m = /^(\d+)([smhd])$/.exec(str);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]];
  return n * unit;
};

const issueTokens = async (user, meta = {}) => {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    jti: generateToken(16), // unique per token, so rotation always produces a new string
  });

  const entry = {
    tokenHash: sha256(refreshToken),
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN)),
  };

  // Keep only non-expired sessions, cap the total
  await User.updateOne({ _id: user._id }, [
    {
      $set: {
        refreshTokens: {
          $slice: [
            {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ["$refreshTokens", []] },
                    cond: { $gt: ["$$this.expiresAt", "$$NOW"] },
                  },
                },
                [entry],
              ],
            },
          -MAX_SESSIONS,
          ],
        },
      },
    },
  ], { updatePipeline: true });

  return { accessToken, refreshToken };
};

export const requestOtp = ({ phone, purpose }) =>
  otpService.sendOtp({ phone, purpose });

export const verifyOtpAndLogin = async ({ phone, otp, name, role, city }, meta) => {
  await otpService.verifyOtp({
    phone,
    code: otp,
    purposes: [OTP_PURPOSE.LOGIN, OTP_PURPOSE.REGISTER],
  });

  let user = await User.findOne({ phone });
  let isNewUser = false;

  if (!user) {
    // Auto-register: name and role are required for a new account
    if (!name || !role) {
      throw AppError.badRequest("New account: 'name' and 'role' are required");
    }
    user = await User.create({ phone, name, role, city, isPhoneVerified: true });
    isNewUser = true;

    if (role === ROLES.WORKER) {
      try {
        await Worker.create({ user: user._id, displayName: name, city });
      } catch (err) {
        await User.deleteOne({ _id: user._id }); // roll back so the user can retry
        throw err;
      }
    }
  } else {
    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      throw AppError.forbidden("Account is not active");
    }
    user.isPhoneVerified = true;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokens(user, meta);
  return { user, isNewUser, ...tokens };
};

export const refreshSession = async (refreshToken, meta) => {
  if (!refreshToken) throw AppError.unauthorized("Refresh token required");

  const decoded = verifyRefreshToken(refreshToken);
  const hash = sha256(refreshToken);

  const user = await User.findById(decoded.sub).select("+refreshTokens");
  if (!user || user.status !== ACCOUNT_STATUS.ACTIVE) {
    throw AppError.unauthorized("Session invalid");
  }

  const idx = user.refreshTokens.findIndex((t) => t.tokenHash === hash);
  if (idx === -1) {
    // Valid signature but not in our list = reuse of an already-rotated token.
    // Treat as theft: kill every session.
    user.refreshTokens = [];
    await user.save();
    throw AppError.unauthorized("Session invalid. Please log in again");
  }

  // Rotate: remove the used token, issue a new pair
  user.refreshTokens.splice(idx, 1);
  await user.save();

  const tokens = await issueTokens(user, meta);
  return { user, ...tokens };
};

export const logout = async (userId, refreshToken) => {
  if (!refreshToken) return;
  await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { tokenHash: sha256(refreshToken) } } }
  );
};

export const logoutAll = async (userId) => {
  await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
};