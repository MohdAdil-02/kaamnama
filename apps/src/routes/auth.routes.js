import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimit.middleware.js";
import { sendOtpSchema, verifyOtpSchema, refreshSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/otp/send", otpLimiter, validate({ body: sendOtpSchema }), ctrl.sendOtp);
router.post("/otp/verify", authLimiter, validate({ body: verifyOtpSchema }), ctrl.verifyOtp);
router.post("/refresh", authLimiter, validate({ body: refreshSchema }), ctrl.refresh);

router.post("/logout", protect, ctrl.logout);
router.post("/logout-all", protect, ctrl.logoutAll);
router.get("/me", protect, ctrl.me);

export default router;