import { Router } from "express";
import * as ctrl from "../controllers/organization.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { publicLimiter } from "../middleware/rateLimit.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createOrgSchema,
  updateOrgSchema,
  inviteSchema,
  orgIdParamSchema,
  memberParamSchema,
  inviteParamSchema,
  leaveParamSchema,
  slugParamSchema,
} from "../validators/organization.validator.js";

const router = Router();

// ---------- Public ----------
router.get("/public/:slug", publicLimiter, validate({ params: slugParamSchema }), ctrl.publicProfile);

// ---------- Worker: invites ----------
router.get("/invites/mine", protect, authorize(ROLES.WORKER), ctrl.myInvites);
router.post(
  "/invites/:memberId/accept",
  protect,
  authorize(ROLES.WORKER),
  validate({ params: inviteParamSchema }),
  ctrl.accept
);
router.post(
  "/invites/:memberId/decline",
  protect,
  authorize(ROLES.WORKER),
  validate({ params: inviteParamSchema }),
  ctrl.decline
);
router.post(
  "/leave/:orgId",
  protect,
  authorize(ROLES.WORKER),
  validate({ params: leaveParamSchema }),
  ctrl.leave
);

// ---------- Org admin ----------
router.use(protect, authorize(ROLES.ORG_ADMIN));

router.post("/", validate({ body: createOrgSchema }), ctrl.create);
router.get("/mine", ctrl.mine);
router.patch("/:id", validate({ params: orgIdParamSchema, body: updateOrgSchema }), ctrl.update);
router.post("/:id/invites", validate({ params: orgIdParamSchema, body: inviteSchema }), ctrl.invite);
router.get("/:id/members", validate({ params: orgIdParamSchema }), ctrl.members);
router.delete("/:id/members/:memberId", validate({ params: memberParamSchema }), ctrl.removeMember);

export default router;