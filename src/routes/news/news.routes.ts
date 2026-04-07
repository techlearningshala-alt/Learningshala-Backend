import { Router } from "express";
import * as NewsController from "../../controllers/news/news.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";
import { createNewsSchema, updateNewsSchema } from "../../validators/news/news.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", NewsController.list);
router.get("/category/:categorySlug", NewsController.getByCategory);
router.get("/:slug", NewsController.get);
router.post(
  "/",
  upload.fields([{ name: "author_image", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
  validate(createNewsSchema),
  NewsController.create
);
router.put(
  "/:id",
  upload.fields([{ name: "author_image", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
  validate(updateNewsSchema),
  NewsController.update
);
router.patch("/:id/toggle-verified", NewsController.toggleVerified);
router.delete("/:id", NewsController.remove);

export default router;
