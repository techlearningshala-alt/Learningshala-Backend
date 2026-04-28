import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createEditorActivityFromClientSchema } from "../validators/admin_activity.validator";
import * as AdminActivityController from "../controllers/admin_activity.controller";

const router = Router();

router.use(authMiddleware);
router.post(
  "/",
  validate(createEditorActivityFromClientSchema),
  AdminActivityController.createFromClient
);
router.get("/", roleMiddleware(["admin"]), AdminActivityController.getAll);

export default router;
