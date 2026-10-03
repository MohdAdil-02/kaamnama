import { Router } from "express";
import * as ctrl from "../controllers/notification.controller.js";
import validate from "../middleware/validation.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from "../validators/notification.validator.js";

const router = Router();

router.use(protect); // any role

router.get("/", validate({ query: listNotificationsQuerySchema }), ctrl.list);
router.get("/unread-count", ctrl.unreadCount);
router.post("/read-all", ctrl.markAllRead);
router.patch("/:id/read", validate({ params: notificationIdParamSchema }), ctrl.markRead);

export default router;