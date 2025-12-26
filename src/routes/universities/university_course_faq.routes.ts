import { Router } from "express";
import * as UniversityCourseFaqController from "../../controllers/universities/university_course_faq.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createUniversityCourseFaqQuestionSchema,
  updateUniversityCourseFaqQuestionSchema,
} from "../../validators/universities/university_course_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// -------- Question Routes --------
router.get("/", UniversityCourseFaqController.listAdminQuestion);
router.get("/questions", UniversityCourseFaqController.listAllQuestions);
router.get("/categories/:categoryId/questions", UniversityCourseFaqController.listQuestions);
router.get("/questions/:id", UniversityCourseFaqController.getQuestion);
router.post("/questions", validate(createUniversityCourseFaqQuestionSchema), UniversityCourseFaqController.createQuestion);
router.put("/questions/:id", validate(updateUniversityCourseFaqQuestionSchema), UniversityCourseFaqController.updateQuestion);
router.delete("/questions/:id", UniversityCourseFaqController.deleteQuestion);

export default router;

