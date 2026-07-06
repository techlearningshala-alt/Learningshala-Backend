import { Router } from "express";
import * as StudentLeadController from "../controllers/student_lead.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { externalFormsApiKeyMiddleware } from "../middlewares/external-forms-api-key.middleware";
import {
  createStudentLeadSchema,
  updateStudentLeadSchema,
} from "../validators/student_lead.validator";

const router = Router();

// Public form submission (external website)
router.post(
  "/",
  externalFormsApiKeyMiddleware,
  validate(createStudentLeadSchema),
  StudentLeadController.create
);

// Admin / CMS
router.get("/", authMiddleware, StudentLeadController.getAll);
router.get("/:id", authMiddleware, StudentLeadController.getById);
router.put(
  "/:id",
  authMiddleware,
  validate(updateStudentLeadSchema),
  StudentLeadController.update
);

export default router;
