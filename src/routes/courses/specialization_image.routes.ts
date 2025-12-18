import { Router } from "express";
import * as SpecializationImageController from "../../controllers/courses/specialization_image.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", SpecializationImageController.getAll);
router.get("/select", SpecializationImageController.getAllForSelect);
router.get("/:id", SpecializationImageController.getOne);
router.post("/", upload.any(), SpecializationImageController.create);
router.put("/:id", upload.any(), SpecializationImageController.update);
router.delete("/:id", SpecializationImageController.remove);

export default router;

