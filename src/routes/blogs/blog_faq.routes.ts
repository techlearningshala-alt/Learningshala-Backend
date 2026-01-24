import { Router } from "express";
import * as BlogFaqController from "../../controllers/blogs/blog_faq.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createBlogFaqQuestionSchema,
  updateBlogFaqQuestionSchema,
} from "../../validators/blogs/blog_faq.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// -------- Question Routes --------
router.get("/", BlogFaqController.listAdminQuestions);
router.get("/questions", BlogFaqController.listAllQuestions);
router.get("/blogs/:blogId/questions", BlogFaqController.listQuestionsByBlogId);
router.get("/questions/:id", BlogFaqController.getQuestion);
router.post("/questions", validate(createBlogFaqQuestionSchema), BlogFaqController.createQuestion);
router.put("/questions/:id", validate(updateBlogFaqQuestionSchema), BlogFaqController.updateQuestion);
router.delete("/questions/:id", BlogFaqController.deleteQuestion);

export default router;
