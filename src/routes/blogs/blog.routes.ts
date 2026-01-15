import { Router } from "express";
import * as BlogController from "../../controllers/blogs/blog.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../../validators/blogs/blog.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", BlogController.list);
router.get("/:id", BlogController.get);
router.post("/", upload.fields([{ name: "author_image", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), validate(createBlogSchema), BlogController.create);
router.put("/:id", upload.fields([{ name: "author_image", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), validate(updateBlogSchema), BlogController.update);
router.patch("/:id/toggle-verified", BlogController.toggleVerified);
router.delete("/:id", BlogController.remove);

export default router;
