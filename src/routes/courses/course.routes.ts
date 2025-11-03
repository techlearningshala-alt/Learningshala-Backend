import { Router } from "express";
import * as CourseController from "../../controllers/courses/course.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer"; // multer setup for thumbnail

const router = Router();

router.get("/", CourseController.getAll);
router.get("/course-name", CourseController.getCourseName);
router.get("/:id", CourseController.getOne);
router.post("/",  upload.single("thumbnail"), CourseController.create);
router.put("/:id", upload.single("thumbnail"), CourseController.update);
router.delete("/:id",  CourseController.remove);

export default router;