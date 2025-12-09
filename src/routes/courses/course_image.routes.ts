import { Router } from "express";
import * as CourseImageController from "../../controllers/courses/course_image.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", CourseImageController.getAll);
router.get("/select", CourseImageController.getAllForSelect);
router.get("/:id", CourseImageController.getOne);
router.post("/", upload.any(), CourseImageController.create);
router.put("/:id", upload.any(), CourseImageController.update);
router.delete("/:id", CourseImageController.remove);

export default router;

