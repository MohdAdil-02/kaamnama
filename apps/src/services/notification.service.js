import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";

// Never let a failed notification break the main request
export const notify = async (userId, { type, title, body, data }) => {
  try {
    await Notification.create({ user: userId, type, title, body, data });
  } catch (err) {
    console.warn("Notification failed:", err.message);
  }
};

export const listForUser = async (userId, query) => {
  const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 50 });
  const filter = { user: userId };
  if (query.unread === true) filter.isRead = false;

  const [items, total, unread] = await Promise.all([
    Notification.find(filter)
      .select("type title body data isRead readAt createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return { items, meta: { ...buildPaginationMeta({ total, page, limit }), unread } };
};

export const unreadCount = (userId) =>
  Notification.countDocuments({ user: userId, isRead: false });

export const markRead = async (userId, id) => {
  const notification = await Notification.findOne({ _id: id, user: userId });
  if (!notification) throw AppError.notFound("Notification not found");
  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }
  return notification;
};

export const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return result.modifiedCount;
};