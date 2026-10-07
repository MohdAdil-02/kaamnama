import cron from "node-cron";
import env from "../config/environment.js";
import logger from "../config/logger.js";
import Sentry from "../config/sentry.js";
import { expireStaleReceipts } from "./notification.job.js";
import { recomputeAllTrustScores } from "./trustScore.job.js";

const running = new Set();

const guarded = (name, fn) => async () => {
  if (running.has(name)) {
    logger.warn({ job: name }, "job still running, skipping this tick");
    return;
  }
  running.add(name);
  const started = Date.now();
  try {
    const result = await fn();
    logger.info({ job: name, ms: Date.now() - started, result }, "job finished");
  } catch (err) {
    logger.error({ err, job: name }, "job failed");
    Sentry.captureException(err, { tags: { job: name } });
  } finally {
    running.delete(name);
  }
};

export const startJobs = () => {
  if (!env.ENABLE_JOBS) {
    logger.info("Background jobs disabled (ENABLE_JOBS=false)");
    return;
  }

  // Every hour, on the hour
  cron.schedule("0 * * * *", guarded("expire-receipts", expireStaleReceipts));

  // Every night at 02:30 India time
  cron.schedule("30 2 * * *", guarded("recompute-trust", recomputeAllTrustScores), {
    timezone: "Asia/Kolkata",
  });

  logger.info("🕒 Background jobs scheduled (hourly expiry, nightly trust recompute)");
};