import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import env from "./config/environment.js";
import requestLogger from "./middleware/requestLogger.middleware.js";
import { globalLimiter } from "./middleware/rateLimit.middleware.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import directoryRoutes from "./routes/directory.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import accountRoutes from "./routes/account.routes.js";

const app = express();

if (env.isProd) app.set("trust proxy", 1);
app.disable("x-powered-by");

// Request ID + logging first, so every later log line carries the ID
app.use(requestLogger);

// ---------- Security & parsing ----------
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL.split(",").map((s) => s.trim()),
    credentials: true,
    exposedHeaders: ["X-Request-Id"],
  })
);
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

const stripOperators = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else {
      stripOperators(obj[key]);
    }
  }
  return obj;
};
app.use((req, res, next) => {
  stripOperators(req.body);
  stripOperators(req.params);
  stripOperators(req.query);
  next();
});

app.use(globalLimiter);

// ---------- Health ----------
// Liveness: the process is up
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "kaamnama-api",
    env: env.NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Readiness: the process AND the database are usable
app.get("/health/ready", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ success: dbUp, db: dbUp ? "up" : "down" });
});

// ---------- API routes ----------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workers", workerRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/directory", directoryRoutes);
app.use("/api/v1/receipts", receiptRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/ratings", ratingRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/account", accountRoutes);

// ---------- Errors (must be last) ----------
app.use(notFound);
app.use(errorHandler);

export default app;