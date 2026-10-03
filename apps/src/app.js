import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "./config/environment.js";
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


const app = express();

if (env.isProd) app.set("trust proxy", 1);
app.disable("x-powered-by");

// ---------- Security & parsing ----------
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan("dev"));

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
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "kaamnama-api",
    env: env.NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
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
// Step 12: admin

// ---------- Errors (must be last) ----------
app.use(notFound);
app.use(errorHandler);

export default app;