import JobReceipt from "../models/JobReceipt.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { RECEIPT_STATUS } from "../constants/statuses.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { disputeVerifiedReceipt, DISPUTE_WINDOW_DAYS } from "../services/dispute.service.js";

const WORKER_FIELDS = "displayName photoUrl publicId slug tier city";
const meta = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"] });

// Receipts are matched by phone, so ones created before signup are included.
export const listMyReceipts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { customerPhone: req.user.phone };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    JobReceipt.find(filter)
      .select("-workerUser -verifyTokenHash")
      .populate("worker", WORKER_FIELDS)
      .populate("category", "name slug")
      .sort({ workDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JobReceipt.countDocuments(filter),
  ]);

  res.json({ success: true, data: { receipts: items }, meta: buildPaginationMeta({ total, page, limit }) });
});

export const getMyReceipt = asyncHandler(async (req, res) => {
  const receipt = await JobReceipt.findOne({ _id: req.params.id, customerPhone: req.user.phone })
    .select("-workerUser -verifyTokenHash")
    .populate("worker", WORKER_FIELDS)
    .populate("category", "name slug")
    .lean();
  if (!receipt) throw AppError.notFound("Receipt not found");
  res.json({ success: true, data: { receipt } });
});

// Workers this customer has used, with verified job counts
export const listMyWorkers = asyncHandler(async (req, res) => {
  const rows = await JobReceipt.aggregate([
    { $match: { customerPhone: req.user.phone, status: RECEIPT_STATUS.VERIFIED } },
    {
      $group: {
        _id: "$worker",
        jobs: { $sum: 1 },
        totalSpent: { $sum: "$amount" },
        lastJobAt: { $max: "$workDate" },
      },
    },
    { $sort: { lastJobAt: -1 } },
    { $limit: 100 },
    { $lookup: { from: "workers", localField: "_id", foreignField: "_id", as: "worker" } },
    { $unwind: "$worker" },
    {
      $project: {
        _id: 0,
        jobs: 1,
        totalSpent: 1,
        lastJobAt: 1,
        isRepeat: { $gte: ["$jobs", 2] },
        worker: {
          displayName: "$worker.displayName",
          photoUrl: "$worker.photoUrl",
          publicId: "$worker.publicId",
          slug: "$worker.slug",
          tier: "$worker.tier",
          city: "$worker.city",
        },
      },
    },
  ]);

  res.json({ success: true, data: { workers: rows } });
});

// Dispute a job that was already verified (within the dispute window)
export const disputeReceipt = asyncHandler(async (req, res) => {
  const data = await disputeVerifiedReceipt(req.user, req.params.id, req.body.reason, meta(req));
  res.json({
    success: true,
    message: `Your dispute has been recorded. The worker's record was updated (disputes are allowed within ${DISPUTE_WINDOW_DAYS} days of confirming).`,
    data,
  });
});