import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/Category.js";
import * as directoryService from "../services/directory.service.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .select("name slug icon")
    .sort({ name: 1 })
    .lean();
  res.json({ success: true, data: { categories } });
});

export const searchWorkers = asyncHandler(async (req, res) => {
  const { items, meta } = await directoryService.searchWorkers(req.query);
  res.json({ success: true, data: { workers: items }, meta });
});