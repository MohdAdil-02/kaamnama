import { Router } from "express";
import * as ctrl from "../controllers/worker.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";
import { ROLES } from "../constants/roles.js";
import { updateWorkerSchema } from "../validators/worker.validator.js";

const router = Router();

router.use(protect, authorize(ROLES.WORKER));

router.get("/me", ctrl.getMe);
router.patch("/me", validate({ body: updateWorkerSchema }), ctrl.updateMe);
router.get("/me/trust", ctrl.getTrust);
router.post("/me/photo", uploadSingleImage("photo"), ctrl.uploadPhoto);
router.delete("/me/photo", ctrl.removePhoto);

export default router;