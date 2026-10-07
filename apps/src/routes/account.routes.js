import { Router } from "express";
import * as ctrl from "../controllers/account.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimit.middleware.js";
import { deleteAccountSchema } from "../validators/account.validator.js";

const router = Router();

router.use(protect); // any role

router.get("/export", authLimiter, ctrl.exportData);
router.post("/delete-otp", otpLimiter, ctrl.sendDeleteOtp);
router.delete("/", authLimiter, validate({ body: deleteAccountSchema }), ctrl.deleteAccount);

export default router;