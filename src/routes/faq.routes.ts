import { Router } from "express";
import * as FaqController from "../controllers/faq.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
  createQuestionSchema,
  updateQuestionSchema,
} from "../validators/faq.validator";

const router = Router();

// Categories
router.get("/categories", FaqController.listCategories);
router.get("/categories/:id", FaqController.getCategory);
router.post("/", validate(createCategorySchema), FaqController.createCategory);
router.put("/:id", validate(updateCategorySchema), FaqController.updateCategory);
router.delete("/:id", FaqController.deleteCategory);

// -------- Question Routes --------
router.get("/", FaqController.listAdminQuestion);
router.get("/questions", FaqController.listAllQuestions);
router.get("/categories/:categoryId/questions", FaqController.listQuestions);
router.get("/questions/:id", FaqController.getQuestion);
router.post("/questions", FaqController.createQuestion);
router.put("/questions/:id", FaqController.updateQuestion);
router.delete("/questions/:id", FaqController.deleteQuestion);

export default router;
