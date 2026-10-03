import { z } from "zod";
import { RECEIPT_STATUS } from "../constants/statuses.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const star = z.number().int().min(1).max(5);

export const customerReceiptsQuerySchema = z.object({
  status: z.enum(Object.values(RECEIPT_STATUS)).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const customerIdParamSchema = z.object({ id: objectId });

export const createRatingSchema = z.object({
  receiptId: objectId,
  stars: star,
  punctuality: star.optional(),
  quality: star.optional(),
  behaviour: star.optional(),
  comment: z.string().trim().max(500).optional(),
});

export const workerRatingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});