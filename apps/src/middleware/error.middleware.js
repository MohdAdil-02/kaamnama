import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import env from "../config/environment.js";

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

  if (!isOperational) {
    console.error("💥 UNEXPECTED ERROR:", err);
  }

  const body = {
    success: false,
    message: isOperational || !env.isProd ? error.message : "Something went wrong",
  };
  if (error.details) body.errors = error.details;
  if (!env.isProd) body.stack = err.stack;

  res.status(statusCode).json(body);
};

export default errorHandler;