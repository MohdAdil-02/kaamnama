import JobReceipt from "../models/JobReceipt.js";
import Worker from "../models/Worker.js";
import { RECEIPT_STATUS } from "../constants/statuses.js";

/**
 * A customer is "repeat" for a worker when they have 2+ VERIFIED receipts
 * with that worker. Flags those receipts and recomputes the worker's count.
 * Safe to call repeatedly (idempotent).
 */
export const refreshRepeatStatus = async (workerId, customerPhone) => {
  const verifiedCount = await JobReceipt.countDocuments({
    worker: workerId,
    customerPhone,
    status: RECEIPT_STATUS.VERIFIED,
  });

  if (verifiedCount >= 2) {
    await JobReceipt.updateMany(
      { worker: workerId, customerPhone, status: RECEIPT_STATUS.VERIFIED },
      { $set: { isRepeatCustomer: true } }
    );
  }

  await recomputeRepeatCustomers(workerId);
  return verifiedCount >= 2;
};

// Number of distinct customers with 2+ verified jobs for this worker
export const recomputeRepeatCustomers = async (workerId) => {
  const rows = await JobReceipt.aggregate([
    { $match: { worker: workerId, status: RECEIPT_STATUS.VERIFIED } },
    { $group: { _id: "$customerPhone", jobs: { $sum: 1 } } },
    { $match: { jobs: { $gte: 2 } } },
    { $count: "n" },
  ]);
  const count = rows[0]?.n || 0;
  await Worker.updateOne({ _id: workerId }, { repeatCustomersCount: count });
  return count;
};