import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export const hashValue = (value) => bcrypt.hash(String(value), SALT_ROUNDS);
export const compareHash = (value, hash) => bcrypt.compare(String(value), hash);

// Fast, deterministic hash (for refresh tokens, lookup tokens)
export const sha256 = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

// Cryptographically secure numeric OTP
export const generateNumericOtp = (length = 6) => {
  const max = 10 ** length;
  return String(crypto.randomInt(0, max)).padStart(length, "0");
};

export const generateToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");