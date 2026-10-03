import multer from "multer";
import AppError from "../utils/AppError.js";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage(); // buffer goes straight to Cloudinary

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(AppError.badRequest("Only JPG, PNG or WEBP images are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadSingleImage = (field = "image") => upload.single(field);
export const uploadMultipleImages = (field = "images", max = 5) =>
  upload.array(field, max);