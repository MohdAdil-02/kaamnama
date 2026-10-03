import AuditLog from "../models/AuditLog.js";

// Never let a failed log write break the admin action itself
export const logAction = async (req, action, { targetType, targetId, before, after } = {}) => {
  try {
    await AuditLog.create({
      actor: req.user._id,
      action,
      targetType,
      targetId,
      before,
      after,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    console.warn("Audit log failed:", err.message);
  }
};