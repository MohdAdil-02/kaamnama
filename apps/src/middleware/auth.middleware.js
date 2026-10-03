import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { ACCOUNT_STATUS } from "../constants/statuses.js";

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

const loadUser = async (token) => {
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.sub);
  if (!user) throw AppError.unauthorized("User no longer exists");
  if (user.status !== ACCOUNT_STATUS.ACTIVE) {
    throw AppError.forbidden("Account is not active");
  }
  return user;
};

// Requires a valid access token
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw AppError.unauthorized("Authentication required");
  req.user = await loadUser(token);
  next();
});

// Attaches req.user if a valid token is present, otherwise continues anonymously
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = await loadUser(token);
    } catch {
      // ignore: treat as anonymous
    }
  }
  next();
});