import { Router } from "express";
import * as UniversityCourseSpecializationFaqController from "../controllers/university_course_specialization_faq.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createUniversityCourseSpecializationFaqQuestionSchema,
  updateUniversityCourseSpecializationFaqQuestionSchema,
} from "../validators/university_course_specialization_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// -------- Question Routes --------
router.get("/", UniversityCourseSpecializationFaqController.listAdminQuestion);
router.get("/questions", UniversityCourseSpecializationFaqController.listAllQuestions);
router.get("/categories/:categoryId/questions", UniversityCourseSpecializationFaqController.listQuestions);
router.get("/questions/:id", UniversityCourseSpecializationFaqController.getQuestion);
router.post("/questions", validate(createUniversityCourseSpecializationFaqQuestionSchema), UniversityCourseSpecializationFaqController.createQuestion);
router.put("/questions/:id", validate(updateUniversityCourseSpecializationFaqQuestionSchema), UniversityCourseSpecializationFaqController.updateQuestion);
router.delete("/questions/:id", UniversityCourseSpecializationFaqController.deleteQuestion);

export default router;

