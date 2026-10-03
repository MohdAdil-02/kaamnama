import AppError from "../utils/AppError.js";

// router.get("/x", protect, authorize(ROLES.ADMIN), handler)
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(AppError.unauthorized("Authentication required"));
  if (!allowedRoles.includes(req.user.role)) {
    return next(AppError.forbidden("You do not have permission to do this"));
  }
  next();
};