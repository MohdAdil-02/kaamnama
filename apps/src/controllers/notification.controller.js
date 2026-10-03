import asyncHandler from "../utils/asyncHandler.js";
import * as notificationService from "../services/notification.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await notificationService.listForUser(req.user._id, req.query);
  res.json({ success: true, data: { notifications: items }, meta });
});

export const unreadCount = asyncHandler(async (req, res) => {
  const unread = await notificationService.unreadCount(req.user._id);
  res.json({ success: true, data: { unread } });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.user._id, req.params.id);
  res.json({ success: true, data: { notification } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const updated = await notificationService.markAllRead(req.user._id);
  res.json({ success: true, data: { updated } });
});