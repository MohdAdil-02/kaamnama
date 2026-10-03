import env from "./config/environment.js";
import { connectDB, disconnectDB } from "./config/database.js";
import app from "./app.js";
import { startJobs } from "./jobs/index.js";

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

await connectDB();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Kaamnama API running on port ${env.PORT} (${env.NODE_ENV})`);
  startJobs();
});

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDB();
    console.log("Closed. Bye 👋");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err);
  server.close(() => process.exit(1));
});