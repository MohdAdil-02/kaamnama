import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import env from "../config/environment.js";
import logger from "../config/logger.js";
import Sentry from "../config/sentry.js";

// Convert known library errors into AppError so the response is consistent.
const normalizeError = (err) => {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return new AppError("Validation failed", 400, details);
  }

  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new AppError("Validation failed", 400, details);
  }

  if (err.name === "CastError") {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return new AppError(`Duplicate value for ${field}`, 409);
  }

  if (err.name === "JsonWebTokenError") return new AppError("Invalid token", 401);
  if (err.name === "TokenExpiredError") return new AppError("Token expired", 401);

  if (err.name === "MulterError") {
    const msg =
      err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB)" : err.message;
    return new AppError(msg, 400);
  }

  if (err.type === "entity.parse.failed") {
    return new AppError("Invalid JSON body", 400);
  }
  if (err.type === "entity.too.large") {
    return new AppError("Request body too large", 413);
  }

  return err;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational === true;
  const log = req.log || logger;

  // Expected errors (4xx) are already logged by the request logger.
  // Anything unexpected, or any 5xx, is logged in full and sent to Sentry.
  if (!isOperational || statusCode >= 500) {
    log.error({ err, requestId: req.id }, "unhandled error");
    Sentry.captureException(err, {
      tags: { request_id: req.id },
      user: req.user ? { id: String(req.user._id) } : undefined,
    });
  }

  const body = {
    success: false,
    message: isOperational || !env.isProd ? error.message : "Something went wrong",
    requestId: req.id,
  };
  if (error.details) body.errors = error.details;
  if (!env.isProd) body.stack = err.stack;

  res.status(statusCode).json(body);
};

export default errorHandler;