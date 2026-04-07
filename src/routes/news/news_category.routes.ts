import { Router } from "express";
import * as NewsCategoryController from "../../controllers/news/news_category.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createNewsCategorySchema, updateNewsCategorySchema } from "../../validators/news/news_category.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", NewsCategoryController.list);
router.get("/:id", NewsCategoryController.get);
router.post("/", validate(createNewsCategorySchema), NewsCategoryController.create);
router.put("/:id", validate(updateNewsCategorySchema), NewsCategoryController.update);
router.patch("/:id/toggle-visibility", NewsCategoryController.toggleVisibility);
router.delete("/:id", NewsCategoryController.remove);

export default router;
