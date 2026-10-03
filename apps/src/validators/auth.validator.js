import { z } from "zod";
import { OTP_PURPOSE } from "../constants/statuses.js";
import { ROLES } from "../constants/roles.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";

const phone = z
  .string()
  .trim()
  .refine((v) => isValidPhone(v), "Invalid phone number")
  .transform((v) => normalizePhone(v));

export const sendOtpSchema = z.object({
  phone,
  purpose: z.enum([OTP_PURPOSE.LOGIN, OTP_PURPOSE.REGISTER]).default(OTP_PURPOSE.LOGIN),
});

export const verifyOtpSchema = z.object({
  phone,
  otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be numeric"),
  // Only used when the phone is new (auto-registration)
  name: z.string().trim().min(2).max(100).optional(),
    role: z.enum([ROLES.WORKER, ROLES.CUSTOMER, ROLES.ORG_ADMIN]).optional(),
  city: z.string().trim().max(80).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(), // can also come from cookie
});