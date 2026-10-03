import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const updateWorkerSchema = z
  .object({
    displayName: z.string().trim().min(2).max(100),
    bio: z.string().trim().max(500),
    categories: z.array(objectId).max(5),
    skills: z.array(z.string().trim().min(1).max(50)).max(15),
    experienceYears: z.number().int().min(0).max(60),
    city: z.string().trim().min(2).max(80),
    area: z.string().trim().max(80),
    serviceRadiusKm: z.number().min(0).max(200),
    languages: z.array(z.string().trim().min(2).max(30)).max(10),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    isAvailable: z.boolean(),
    isPublic: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Provide at least one field to update")
  .refine(
    (d) => (d.latitude === undefined) === (d.longitude === undefined),
    "latitude and longitude must be sent together"
  );

export const identifierParamSchema = z.object({
  identifier: z.string().trim().min(3).max(80),
});

import { TIERS } from "../constants/tiers.js";

const boolString = z
  .enum(["true", "false"])
  .transform((v) => v === "true");

export const searchWorkersQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(60).optional(),
    category: z.string().trim().toLowerCase().max(60).optional(),
    city: z.string().trim().min(2).max(80).optional(),
    minTier: z.enum(Object.values(TIERS)).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    available: boolString.optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().min(1).max(200).default(10),
    sort: z.enum(["trust", "rating", "jobs", "newest"]).default("trust"),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .refine((d) => (d.lat === undefined) === (d.lng === undefined), {
    message: "lat and lng must be sent together",
    path: ["lat"],
  });