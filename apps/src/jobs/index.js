import cron from "node-cron";
import env from "../config/environment.js";
import { expireStaleReceipts } from "./notification.job.js";
import { recomputeAllTrustScores } from "./trustScore.job.js";

const running = new Set();

const guarded = (name, fn) => async () => {
  if (running.has(name)) {
    console.warn(`⏭️  Job "${name}" is still running, skipping this tick`);
    return;
  }
  running.add(name);
  const started = Date.now();
  try {
    const result = await fn();
    console.log(`🕒 Job "${name}" done in ${Date.now() - started}ms`, result);
  } catch (err) {
    console.error(`💥 Job "${name}" failed:`, err);
  } finally {
    running.delete(name);
  }
};

export const startJobs = () => {
  if (!env.ENABLE_JOBS) {
    console.log("⏸️  Background jobs disabled (ENABLE_JOBS=false)");
    return;
  }

  // Every hour, on the hour
  cron.schedule("0 * * * *", guarded("expire-receipts", expireStaleReceipts));

  // Every night at 02:30 India time
  cron.schedule("30 2 * * *", guarded("recompute-trust", recomputeAllTrustScores), {
    timezone: "Asia/Kolkata",
  });

  console.log("🕒 Background jobs scheduled (hourly expiry, nightly trust recompute)");
};