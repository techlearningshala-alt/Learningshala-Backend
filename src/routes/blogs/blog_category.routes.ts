import { Router } from "express";
import * as BlogCategoryController from "../../controllers/blogs/blog_category.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
} from "../../validators/blogs/blog_category.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", BlogCategoryController.list);
router.get("/:id", BlogCategoryController.get);
router.post("/", validate(createBlogCategorySchema), BlogCategoryController.create);
router.put("/:id", validate(updateBlogCategorySchema), BlogCategoryController.update);
router.delete("/:id", BlogCategoryController.remove);

export default router;
