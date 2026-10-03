import { z } from "zod";
import { isValidPhone, normalizePhone } from "../utils/phone.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createOrgSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  city: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().optional(),
});

export const updateOrgSchema = createOrgSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update");

export const inviteSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine((v) => isValidPhone(v), "Invalid phone number")
    .transform((v) => normalizePhone(v)),
});

export const orgIdParamSchema = z.object({ id: objectId });
export const memberParamSchema = z.object({ id: objectId, memberId: objectId });
export const inviteParamSchema = z.object({ memberId: objectId });
export const leaveParamSchema = z.object({ orgId: objectId });
export const slugParamSchema = z.object({ slug: z.string().trim().min(2).max(120) });