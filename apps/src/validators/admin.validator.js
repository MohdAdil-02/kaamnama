import { z } from "zod";
import { ROLE_LIST } from "../constants/roles.js";
import { ACCOUNT_STATUS, RECEIPT_STATUS } from "../constants/statuses.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const boolString = z.enum(["true", "false"]).transform((v) => v === "true");

const paging = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

export const idParamSchema = z.object({ id: objectId });

export const reasonSchema = z.object({
  reason: z.string().trim().min(5, "Please give a reason (at least 5 characters)").max(300),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(ROLE_LIST).optional(),
  status: z.enum(Object.values(ACCOUNT_STATUS)).optional(),
  q: z.string().trim().min(2).max(60).optional(),
  ...paging,
});

export const listRatingsQuerySchema = z.object({
  hidden: boolString.optional(),
  ...paging,
});

export const listOrgsQuerySchema = z.object({
  verified: boolString.optional(),
  ...paging,
});

export const listReceiptsQuerySchema = z.object({
  status: z.enum(Object.values(RECEIPT_STATUS)).optional(),
  ...paging,
});

export const listAuditQuerySchema = z.object({
  action: z.string().trim().max(60).optional(),
  targetType: z.string().trim().max(40).optional(),
  ...paging,
});