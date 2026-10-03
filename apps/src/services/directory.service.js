import Worker from "../models/Worker.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { ACCOUNT_STATUS } from "../constants/statuses.js";
import { TIER_RULES } from "../constants/tiers.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORTS = {
  trust: { trustScore: -1, verifiedJobsCount: -1, _id: 1 },
  rating: { averageRating: -1, ratingsCount: -1, _id: 1 },
  jobs: { verifiedJobsCount: -1, trustScore: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
};

const PUBLIC_FIELDS =
  "displayName photoUrl publicId slug bio skills experienceYears city area isAvailable " +
  "tier trustScore verifiedJobsCount averageRating ratingsCount repeatCustomersCount categories createdAt";

const kmBetween = (a, b) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const searchWorkers = async (query) => {
  const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 50 });
  const filter = { isPublic: true };

  // Only workers whose account is active
  const inactive = await User.find({ role: "worker", status: { $ne: ACCOUNT_STATUS.ACTIVE } })
    .select("_id")
    .lean();
  if (inactive.length) filter.user = { $nin: inactive.map((u) => u._id) };

  if (query.category) {
    const cat = await Category.findOne({ slug: query.category, isActive: true }).select("_id");
    if (!cat) return { items: [], meta: buildPaginationMeta({ total: 0, page, limit }) };
    filter.categories = cat._id;
  }

  if (query.city) {
    filter.city = new RegExp(`^${escapeRegex(query.city)}$`, "i");
  }

  if (query.minTier) {
    const from = TIER_RULES.findIndex((r) => r.tier === query.minTier);
    filter.tier = { $in: TIER_RULES.slice(from).map((r) => r.tier) };
  }

  if (query.minRating !== undefined) filter.averageRating = { $gte: query.minRating };
  if (query.available === true) filter.isAvailable = true;

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ displayName: rx }, { skills: rx }, { bio: rx }];
  }

  // ---------- Nearby search ----------
  if (query.lat !== undefined) {
    const center = [query.lng, query.lat];
    const workers = await Worker.find({
      ...filter,
      location: {
        $geoWithin: { $centerSphere: [center, query.radiusKm / 6371] },
      },
    })
      .select(PUBLIC_FIELDS + " location")
      .populate("categories", "name slug")
      .limit(500)
      .lean();

    const withDistance = workers
      .map(({ location, ...w }) => ({
        ...w,
        distanceKm: Math.round(kmBetween(center, location.coordinates) * 10) / 10,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm || b.trustScore - a.trustScore);

    return {
      items: withDistance.slice(skip, skip + limit),
      meta: buildPaginationMeta({ total: withDistance.length, page, limit }),
    };
  }

  // ---------- Normal search ----------
  const [items, total] = await Promise.all([
    Worker.find(filter)
      .select(PUBLIC_FIELDS)
      .populate("categories", "name slug")
      .sort(SORTS[query.sort])
      .skip(skip)
      .limit(limit)
      .lean(),
    Worker.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};