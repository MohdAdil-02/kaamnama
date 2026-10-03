import { Router } from "express";
import * as ctrl from "../controllers/rating.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { publicLimiter } from "../middleware/rateLimit.middleware.js";
import { ROLES } from "../constants/roles.js";
import { createRatingSchema, workerRatingsQuerySchema } from "../validators/customer.validator.js";
import { identifierParamSchema } from "../validators/worker.validator.js";

const router = Router();

router.get(
  "/worker/:identifier",
  publicLimiter,
  validate({ params: identifierParamSchema, query: workerRatingsQuerySchema }),
  ctrl.listWorkerRatings
);

router.post("/", protect, authorize(ROLES.CUSTOMER), validate({ body: createRatingSchema }), ctrl.createRating);

export default router;