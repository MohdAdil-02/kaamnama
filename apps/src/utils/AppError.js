export default class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";
    this.isOperational = true; // trusted, expected error
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Bad request", details) { return new AppError(msg, 400, details); }
  static unauthorized(msg = "Unauthorized") { return new AppError(msg, 401); }
  static forbidden(msg = "Forbidden") { return new AppError(msg, 403); }
  static notFound(msg = "Not found") { return new AppError(msg, 404); }
  static conflict(msg = "Conflict") { return new AppError(msg, 409); }
  static tooMany(msg = "Too many requests") { return new AppError(msg, 429); }
}