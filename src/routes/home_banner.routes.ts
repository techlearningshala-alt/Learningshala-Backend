import { Router } from "express";
import * as HomeBannerController from "../controllers/home_banner.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createHomeBannerSchema, updateHomeBannerSchema } from "../validators/home_banner.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", HomeBannerController.getAll);
router.get("/:id", HomeBannerController.getOne);
router.post("/", upload.fields([{ name: "banner_image", maxCount: 1 }]), validate(createHomeBannerSchema), HomeBannerController.create);
router.put("/:id", upload.fields([{ name: "banner_image", maxCount: 1 }]), validate(updateHomeBannerSchema), HomeBannerController.update);
router.delete("/:id", HomeBannerController.remove);

export default router;
