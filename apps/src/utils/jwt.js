import jwt from "jsonwebtoken";
import env from "../config/environment.js";
import AppError from "./AppError.js";

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

const verify = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw AppError.unauthorized("Token expired");
    throw AppError.unauthorized("Invalid token");
  }
};

export const verifyAccessToken = (token) => verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => verify(token, env.JWT_REFRESH_SECRET);