import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";

const ensureConfigured = () => {
  if (!isCloudinaryConfigured()) {
    throw new AppError("Image upload is not configured on the server", 503);
  }
};

export const uploadImageBuffer = (buffer, { folder = "kaamnama", transformation } = {}) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: transformation || [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (err, result) => {
        if (err) return reject(new AppError("Image upload failed", 502));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

export const uploadAvatar = (buffer) =>
  uploadImageBuffer(buffer, {
    folder: "kaamnama/avatars",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

// Best-effort delete: never fail a request because cleanup failed
export const deleteImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Cloudinary delete failed:", err.message);
  }
};