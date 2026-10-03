import mongoose from "mongoose";
import { ORG_MEMBER_ROLES } from "../constants/roles.js";

const membershipSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(ORG_MEMBER_ROLES), default: ORG_MEMBER_ROLES.MEMBER },
    status: { type: String, enum: ["invited", "active", "removed"], default: "invited" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinedAt: Date,
  },
  { timestamps: true }
);

membershipSchema.index({ organization: 1, worker: 1 }, { unique: true });
membershipSchema.index({ worker: 1, status: 1 });

export default mongoose.model("OrganizationMembership", membershipSchema);