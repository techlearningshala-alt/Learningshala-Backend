import { Router } from "express";
import * as BlogFaqController from "../../controllers/blogs/blog_faq.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createBlogFaqCategorySchema,
  updateBlogFaqCategorySchema,
  createBlogFaqQuestionSchema,
  updateBlogFaqQuestionSchema,
} from "../../validators/blogs/blog_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Categories
router.get("/categories", BlogFaqController.listCategories);
router.get("/categories/:id", BlogFaqController.getCategory);
router.post("/categories", validate(createBlogFaqCategorySchema), BlogFaqController.createCategory);
router.put("/categories/:id", validate(updateBlogFaqCategorySchema), BlogFaqController.updateCategory);
router.delete("/categories/:id", BlogFaqController.deleteCategory);

// -------- Question Routes --------
router.get("/", BlogFaqController.listAdminQuestions);
router.get("/questions", BlogFaqController.listAllQuestions);
router.get("/categories/:categoryId/questions", BlogFaqController.listQuestions);
router.get("/blogs/:blogId/questions", BlogFaqController.listQuestionsByBlogId);
router.get("/questions/:id", BlogFaqController.getQuestion);
router.post("/questions", validate(createBlogFaqQuestionSchema), BlogFaqController.createQuestion);
router.put("/questions/:id", validate(updateBlogFaqQuestionSchema), BlogFaqController.updateQuestion);
router.delete("/questions/:id", BlogFaqController.deleteQuestion);

export default router;
