import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    receipt: { type: mongoose.Schema.Types.ObjectId, ref: "JobReceipt", required: true, unique: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    customerUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    behaviour: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    isHidden: { type: Boolean, default: false }, // admin moderation
    hiddenReason: { type: String, trim: true, maxlength: 300 },
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hiddenAt: Date,
  },
  { timestamps: true }
);

ratingSchema.index({ worker: 1, createdAt: -1 });

export default mongoose.model("Rating", ratingSchema);
