import { Router } from "express";
import * as MediaController from "../controllers/media_spotlight.controller";
import { validate } from "../middlewares/validate.middleware";
import { createMediaSpotlightSchema, updateMediaSpotlightSchema } from "../validators/media_spotlight.validator";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", MediaController.getAll);
router.get("/:id", MediaController.getOne);
router.post("/", upload.single("logo"), MediaController.create);
router.put("/:id",upload.single("logo"), MediaController.update);
router.put("/reorder", MediaController.reorder);
router.delete("/:id", MediaController.remove);

export default router;
