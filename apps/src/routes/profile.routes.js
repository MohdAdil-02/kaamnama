import { Router } from "express";
import * as ctrl from "../controllers/profile.controller.js";
import validate from "../middleware/validation.middleware.js";
import { publicLimiter } from "../middleware/rateLimit.middleware.js";
import { identifierParamSchema } from "../validators/worker.validator.js";

const router = Router();

router.get(
  "/:identifier",
  publicLimiter,
  validate({ params: identifierParamSchema }),
  ctrl.getPublicProfile
);

export default router;