import { Router, Request, Response, NextFunction } from "express";
import * as WebsiteBannerController from "../controllers/website_banner.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createWebsiteBannerSchema, updateWebsiteBannerSchema } from "../validators/website_banner.validator";

const router = Router();

router.use(authMiddleware);

// Middleware to set banner_type to 'website' for query params (for GET requests)
router.use((req, res, next) => {
  if (req.query.banner_type === undefined) {
    req.query.banner_type = 'website';
  }
  next();
});

router.get("/", WebsiteBannerController.getAll);
router.get("/:id", WebsiteBannerController.getOne);
router.post("/", upload.fields([{ name: "banner_image", maxCount: 1 }]), validate(createWebsiteBannerSchema), WebsiteBannerController.create);
router.put("/:id", upload.fields([{ name: "banner_image", maxCount: 1 }]), validate(updateWebsiteBannerSchema), WebsiteBannerController.update);
router.delete("/:id", WebsiteBannerController.remove);

export default router;
