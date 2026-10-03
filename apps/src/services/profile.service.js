import { ROLES } from "../constants/roles.js";
import crypto from "crypto";
import Worker from "../models/Worker.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import { ACCOUNT_STATUS } from "../constants/statuses.js";
import { uploadAvatar, deleteImage } from "./upload.service.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
const randomId = (len) =>
  Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("");

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "worker";

// Sets slug + publicId once. Returns true if anything changed.
const ensureIdentifiers = async (worker) => {
  let changed = false;

  if (!worker.publicId) {
    let id;
    do {
      id = `KN${randomId(8)}`;
    } while (await Worker.exists({ publicId: id }));
    worker.publicId = id;
    changed = true;
  }

  if (!worker.slug) {
    let slug;
    do {
      slug = `${slugify(worker.displayName)}-${randomId(5).toLowerCase()}`;
    } while (await Worker.exists({ slug }));
    worker.slug = slug;
    changed = true;
  }

  return changed;
};

export const loadWorker = async (userId) => {
  let worker = await Worker.findOne({ user: userId });

  // Self-heal: a worker-role user must always have a profile
  if (!worker) {
    const user = await User.findById(userId);
    if (user && user.role === ROLES.WORKER) {
      worker = await Worker.create({
        user: user._id,
        displayName: user.name || "Worker",
        city: user.city,
      });
    }
  }

  if (!worker) throw AppError.notFound("Worker profile not found");
  return worker;
};

export const getMyProfile = async (userId) => {
  const worker = await loadWorker(userId);
  if (await ensureIdentifiers(worker)) await worker.save();
  return worker.populate("categories", "name slug icon");
};

export const updateMyProfile = async (userId, data) => {
  const worker = await loadWorker(userId);
  const { latitude, longitude, categories, ...fields } = data;

  if (categories) {
    const unique = [...new Set(categories)];
    const found = await Category.countDocuments({ _id: { $in: unique }, isActive: true });
    if (found !== unique.length) throw AppError.badRequest("One or more categories are invalid");
    worker.categories = unique;
  }

  if (latitude !== undefined && longitude !== undefined) {
    worker.location = { type: "Point", coordinates: [longitude, latitude] }; // [lng, lat]
  }

  Object.assign(worker, fields);
  await ensureIdentifiers(worker);
  await worker.save();

  // Keep the login identity in sync for the fields it shares
  const userUpdate = {};
  if (fields.displayName) userUpdate.name = fields.displayName;
  if (fields.city) userUpdate.city = fields.city;
  if (Object.keys(userUpdate).length) await User.updateOne({ _id: userId }, userUpdate);

  return worker.populate("categories", "name slug icon");
};

export const updatePhoto = async (userId, file) => {
  if (!file) throw AppError.badRequest("Image file required (form field name: photo)");

  const worker = await loadWorker(userId);
  const uploaded = await uploadAvatar(file.buffer);
  const oldPublicId = worker.photoPublicId;

  worker.photoUrl = uploaded.url;
  worker.photoPublicId = uploaded.publicId;
  await worker.save();
  await User.updateOne({ _id: userId }, { avatarUrl: uploaded.url });

  await deleteImage(oldPublicId); // only after the new one is safely saved
  return { photoUrl: worker.photoUrl };
};

export const removePhoto = async (userId) => {
  const worker = await loadWorker(userId);
  const oldPublicId = worker.photoPublicId;

  worker.photoUrl = undefined;
  worker.photoPublicId = undefined;
  await worker.save();
  await User.updateOne({ _id: userId }, { $unset: { avatarUrl: 1 } });

  await deleteImage(oldPublicId);
};

export const getPublicProfile = async (identifier) => {
  const worker = await Worker.findOne({
    $or: [{ slug: identifier.toLowerCase() }, { publicId: identifier.toUpperCase() }],
    isPublic: true,
  })
    .populate("categories", "name slug icon")
    .lean();

  if (!worker) throw AppError.notFound("Profile not found");

  const active = await User.exists({ _id: worker.user, status: ACCOUNT_STATUS.ACTIVE });
  if (!active) throw AppError.notFound("Profile not found");

  // Whitelist: never leak user id, phone, or exact coordinates
  return {
    publicId: worker.publicId,
    slug: worker.slug,
    displayName: worker.displayName,
    bio: worker.bio,
    photoUrl: worker.photoUrl,
    categories: worker.categories,
    skills: worker.skills,
    languages: worker.languages,
    experienceYears: worker.experienceYears,
    city: worker.city,
    area: worker.area,
    isAvailable: worker.isAvailable,
    tier: worker.tier,
    trustScore: worker.trustScore,
    verifiedJobsCount: worker.verifiedJobsCount,
    averageRating: worker.averageRating,
    ratingsCount: worker.ratingsCount,
    memberSince: worker.createdAt,
  };
};