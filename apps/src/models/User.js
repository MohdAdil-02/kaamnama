import mongoose from "mongoose";
import { ROLE_LIST, ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUS } from "../constants/statuses.js";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    userAgent: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true, index: true }, // E.164
    name: { type: String, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    role: { type: String, enum: ROLE_LIST, default: ROLES.CUSTOMER, index: true },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    avatarUrl: String,
    city: { type: String, trim: true },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
    refreshTokens: { type: [refreshTokenSchema], select: false },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);