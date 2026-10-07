import Sentry from "./config/sentry.js";
import env from "./config/environment.js";
import logger from "./config/logger.js";
import { connectDB, disconnectDB } from "./config/database.js";
import app from "./app.js";
import { startJobs } from "./jobs/index.js";

// Log, report, flush, then exit. Exiting without flushing would lose the report.
const dieWith = async (label, err) => {
  logger.fatal({ err }, label);
  Sentry.captureException(err);
  await Sentry.flush(2000).catch(() => {});
  process.exit(1);
};

process.on("uncaughtException", (err) => dieWith("uncaught exception", err));

await connectDB();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Kaamnama API running on port ${env.PORT} (${env.NODE_ENV})`);
  startJobs();
});

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDB();
    logger.info("Closed. Bye 👋");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  server.close(() => dieWith("unhandled rejection", err));
});