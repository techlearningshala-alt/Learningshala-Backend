import { Router } from "express";
import * as CourseController from "../../controllers/courses/course.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer"; // multer setup for thumbnail

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/:id", CourseController.getOne);
router.get("/", CourseController.getAll);
router.get("/course-name", CourseController.getCourseName);
router.get("/by-domain", CourseController.getCoursesByDomain);
router.get("/:slug", CourseController.getBySlug);
router.post("/", upload.any(), CourseController.create);
router.put("/:id", upload.any(), CourseController.update);
router.patch("/:id/toggle-status", CourseController.toggleStatus);
router.patch(
  "/:id/toggle-menu-visibility",
  CourseController.toggleMenuVisibility
);
router.delete("/:id", CourseController.remove);

export default router;