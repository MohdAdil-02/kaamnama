import { Router } from "express";
import * as ctrl from "../controllers/customer.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { customerReceiptsQuerySchema, customerIdParamSchema } from "../validators/customer.validator.js";

const router = Router();

router.use(protect, authorize(ROLES.CUSTOMER));

router.get("/me/receipts", validate({ query: customerReceiptsQuerySchema }), ctrl.listMyReceipts);
router.get("/me/receipts/:id", validate({ params: customerIdParamSchema }), ctrl.getMyReceipt);
router.get("/me/workers", ctrl.listMyWorkers);

export default router;