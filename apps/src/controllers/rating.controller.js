import Rating from "../models/Rating.js";
import JobReceipt from "../models/JobReceipt.js";
import Worker from "../models/Worker.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { RECEIPT_STATUS, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { recomputeTrustScore } from "../services/trustScore.service.js";
import { notify } from "../services/notification.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const RATING_WINDOW_DAYS = 30;

export const createRating = asyncHandler(async (req, res) => {
  const { receiptId, stars, punctuality, quality, behaviour, comment } = req.body;

  const receipt = await JobReceipt.findOne({ _id: receiptId, customerPhone: req.user.phone });
  if (!receipt) throw AppError.notFound("Receipt not found");
  if (receipt.status !== RECEIPT_STATUS.VERIFIED) {
    throw AppError.badRequest("Only verified jobs can be rated");
  }
  if (receipt.verifiedAt && Date.now() - receipt.verifiedAt.getTime() > RATING_WINDOW_DAYS * DAY_MS) {
    throw AppError.badRequest(`Ratings can only be given within ${RATING_WINDOW_DAYS} days of verification`);
  }

  let rating;
  try {
    rating = await Rating.create({
      receipt: receipt._id,
      worker: receipt.worker,
      customerUser: req.user._id,
      stars,
      punctuality,
      quality,
      behaviour,
      comment,
    });
  } catch (err) {
    if (err.code === 11000) throw AppError.conflict("You have already rated this job");
    throw err;
  }

  const trust = await recomputeTrustScore(receipt.worker);

  await notify(receipt.workerUser, {
    type: NOTIFICATION_TYPE.RATING_RECEIVED,
    title: "New rating",
    body: `You received ${stars} star${stars > 1 ? "s" : ""} for "${receipt.title}"`,
    data: { receiptId: receipt._id, ratingId: rating._id },
  });

  res.status(201).json({
    success: true,
    message: "Thanks for your rating",
    data: { rating, workerTrust: trust && { score: trust.score, tier: trust.tier } },
  });
});

// Public: visible ratings for a worker (slug or public ID)
export const listWorkerRatings = asyncHandler(async (req, res) => {
  const id = req.params.identifier;
  const worker = await Worker.findOne({
    $or: [{ slug: id.toLowerCase() }, { publicId: id.toUpperCase() }],
    isPublic: true,
  }).select("averageRating ratingsCount");
  if (!worker) throw AppError.notFound("Profile not found");

  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { worker: worker._id, isHidden: false };

  const [rows, total] = await Promise.all([
    Rating.find(filter)
      .select("stars punctuality quality behaviour comment createdAt customerUser")
      .populate("customerUser", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Rating.countDocuments(filter),
  ]);

  const ratings = rows.map(({ customerUser, ...r }) => ({
    ...r,
    customerName: customerUser?.name ? customerUser.name.split(" ")[0] : "Customer",
  }));

  res.json({
    success: true,
    data: { averageRating: worker.averageRating, ratingsCount: worker.ratingsCount, ratings },
    meta: buildPaginationMeta({ total, page, limit }),
  });
});