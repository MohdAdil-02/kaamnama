import { Router } from "express";
import * as ctrl from "../controllers/receipt.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadMultipleImages } from "../middleware/upload.middleware.js";
import { authLimiter, otpLimiter, publicLimiter } from "../middleware/rateLimit.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createReceiptSchema,
  listReceiptsQuerySchema,
  idParamSchema,
  tokenParamSchema,
  confirmSchema,
} from "../validators/receipt.validator.js";

const router = Router();

// ---------- Public: customer verifies via QR/link (no login) ----------
router.get("/verify/:token", publicLimiter, validate({ params: tokenParamSchema }), ctrl.previewByToken);
router.post("/verify/:token/otp", otpLimiter, validate({ params: tokenParamSchema }), ctrl.sendReceiptOtp);
router.post(
  "/verify/:token/confirm",
  authLimiter,
  validate({ params: tokenParamSchema, body: confirmSchema }),
  ctrl.confirmReceipt
);

// ---------- Worker only (everything below requires login) ----------
router.use(protect, authorize(ROLES.WORKER));

router.post("/", validate({ body: createReceiptSchema }), ctrl.createReceipt);
router.get("/", validate({ query: listReceiptsQuerySchema }), ctrl.listReceipts);
router.get("/:id", validate({ params: idParamSchema }), ctrl.getReceipt);
router.post("/:id/qr", validate({ params: idParamSchema }), ctrl.refreshQr);
router.post("/:id/send-link", validate({ params: idParamSchema }), ctrl.sendLink);
router.post(
  "/:id/photos",
  validate({ params: idParamSchema }),
  uploadMultipleImages("photos", 5),
  ctrl.uploadPhotos
);

export default router;