import { Router } from "express";
import * as UniversityFaqController from "../controllers/university_faq.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createUniversityFaqCategorySchema,
  updateUniversityFaqCategorySchema,
  createUniversityFaqQuestionSchema,
  updateUniversityFaqQuestionSchema,
} from "../validators/university_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Categories
router.get("/categories", UniversityFaqController.listCategories);
router.get("/categories/:id", UniversityFaqController.getCategory);
router.post("/", validate(createUniversityFaqCategorySchema), UniversityFaqController.createCategory);
router.put("/:id", validate(updateUniversityFaqCategorySchema), UniversityFaqController.updateCategory);
router.delete("/:id", UniversityFaqController.deleteCategory);

// -------- Question Routes --------
router.get("/", UniversityFaqController.listAdminQuestion);
router.get("/questions", UniversityFaqController.listAllQuestions);
router.get("/categories/:categoryId/questions", UniversityFaqController.listQuestions);
router.get("/questions/:id", UniversityFaqController.getQuestion);
router.post("/questions", validate(createUniversityFaqQuestionSchema), UniversityFaqController.createQuestion);
router.put("/questions/:id", validate(updateUniversityFaqQuestionSchema), UniversityFaqController.updateQuestion);
router.delete("/questions/:id", UniversityFaqController.deleteQuestion);

export default router;

