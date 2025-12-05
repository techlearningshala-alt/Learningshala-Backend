import { Router } from "express";
import * as SpecializationFaqController from "../../controllers/courses/specialization_faq.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createSpecializationFaqQuestionSchema,
  updateSpecializationFaqQuestionSchema,
} from "../../validators/courses/specialization_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Questions routes (using course FAQ categories)
router.get("/specializations/:specializationId/questions", SpecializationFaqController.listQuestionsBySpecializationId);
router.get("/questions/:id", SpecializationFaqController.getQuestion);
router.post("/questions", validate(createSpecializationFaqQuestionSchema), SpecializationFaqController.createQuestion);
router.put("/questions/:id", validate(updateSpecializationFaqQuestionSchema), SpecializationFaqController.updateQuestion);
router.delete("/questions/:id", SpecializationFaqController.deleteQuestion);

export default router;

