import { Router } from "express";
import * as CourseFaqController from "../../controllers/courses/course_faq.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createCourseFaqCategorySchema,
  updateCourseFaqCategorySchema,
  createCourseFaqQuestionSchema,
  updateCourseFaqQuestionSchema,
} from "../../validators/courses/course_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Categories
router.get("/categories", CourseFaqController.listCategories);
router.get("/categories/:id", CourseFaqController.getCategory);
router.post("/", validate(createCourseFaqCategorySchema), CourseFaqController.createCategory);
router.put("/:id", validate(updateCourseFaqCategorySchema), CourseFaqController.updateCategory);
router.delete("/:id", CourseFaqController.deleteCategory);

// -------- Question Routes --------
router.get("/", CourseFaqController.listAdminQuestion);
router.get("/questions", CourseFaqController.listAllQuestions);
router.get("/categories/:categoryId/questions", CourseFaqController.listQuestions);
router.get("/courses/:courseId/questions", CourseFaqController.listQuestionsByCourseId);
router.get("/questions/:id", CourseFaqController.getQuestion);
router.post("/questions", validate(createCourseFaqQuestionSchema), CourseFaqController.createQuestion);
router.put("/questions/:id", validate(updateCourseFaqQuestionSchema), CourseFaqController.updateQuestion);
router.delete("/questions/:id", CourseFaqController.deleteQuestion);

export default router;

