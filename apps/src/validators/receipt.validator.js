import { z } from "zod";
import { RECEIPT_STATUS } from "../constants/statuses.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const DAY = 24 * 60 * 60 * 1000;

const phone = z
  .string()
  .trim()
  .refine((v) => isValidPhone(v), "Invalid phone number")
  .transform((v) => normalizePhone(v));

export const createReceiptSchema = z.object({
  customerPhone: phone,
  customerName: z.string().trim().min(2).max(100).optional(),
  category: objectId,
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(1000).optional(),
  amount: z.number().min(0).max(10_000_000).default(0),
  workDate: z.coerce
    .date()
    .refine((d) => d.getTime() <= Date.now() + DAY, "Work date cannot be in the future")
    .refine((d) => d.getTime() >= Date.now() - 90 * DAY, "Work date cannot be older than 90 days"),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(80).optional(),
});

export const listReceiptsQuerySchema = z.object({
  status: z.enum(Object.values(RECEIPT_STATUS)).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const idParamSchema = z.object({ id: objectId });

export const tokenParamSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{32,96}$/i, "Invalid verification link"),
});

export const confirmSchema = z
  .object({
    otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be numeric"),
    action: z.enum(["verify", "dispute", "reject"]).default("verify"),
    reason: z.string().trim().max(500).optional(),
    channel: z.enum(["qr", "link"]).default("link"), // how the customer arrived
  })
  .refine((d) => d.action !== "dispute" || (d.reason && d.reason.length >= 5), {
    message: "Please describe the issue (at least 5 characters)",
    path: ["reason"],
  });