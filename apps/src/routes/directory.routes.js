import { Router } from "express";
import * as ctrl from "../controllers/directory.controller.js";
import validate from "../middleware/validation.middleware.js";
import { publicLimiter } from "../middleware/rateLimit.middleware.js";
import { searchWorkersQuerySchema } from "../validators/worker.validator.js";

const router = Router();

router.get("/categories", publicLimiter, ctrl.listCategories);
router.get("/workers", publicLimiter, validate({ query: searchWorkersQuerySchema }), ctrl.searchWorkers);

export default router;