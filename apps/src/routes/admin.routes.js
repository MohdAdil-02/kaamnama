import { Router } from "express";
import * as ctrl from "../controllers/admin.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import {
  idParamSchema,
  reasonSchema,
  listUsersQuerySchema,
  listRatingsQuerySchema,
  listOrgsQuerySchema,
  listReceiptsQuerySchema,
  listAuditQuerySchema,
} from "../validators/admin.validator.js";

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/stats", ctrl.stats);

router.get("/users", validate({ query: listUsersQuerySchema }), ctrl.listUsers);
router.post("/users/:id/suspend", validate({ params: idParamSchema, body: reasonSchema }), ctrl.suspendUser);
router.post("/users/:id/reactivate", validate({ params: idParamSchema }), ctrl.reactivateUser);

router.get("/ratings", validate({ query: listRatingsQuerySchema }), ctrl.listRatings);
router.post("/ratings/:id/hide", validate({ params: idParamSchema, body: reasonSchema }), ctrl.hideRating);
router.post("/ratings/:id/unhide", validate({ params: idParamSchema }), ctrl.unhideRating);

router.get("/organizations", validate({ query: listOrgsQuerySchema }), ctrl.listOrgs);
router.post("/organizations/:id/verify", validate({ params: idParamSchema }), ctrl.verifyOrg);
router.post("/organizations/:id/unverify", validate({ params: idParamSchema }), ctrl.unverifyOrg);

router.get("/receipts", validate({ query: listReceiptsQuerySchema }), ctrl.listReceipts);
router.get("/audit-logs", validate({ query: listAuditQuerySchema }), ctrl.listAuditLogs);

export default router;