import { Router } from "express";
import * as SpecializationController from "../../controllers/courses/specialization.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", SpecializationController.getAll);
router.get("/:course_slug/:slug", SpecializationController.getByCourseSlugAndSpecializationSlug);
router.get("/:id", SpecializationController.getOne);
router.post("/", upload.any(), SpecializationController.create);
router.put("/:id", upload.any(), SpecializationController.update);
router.patch("/:id/toggle-status", SpecializationController.toggleStatus);
router.patch("/:id/toggle-menu-visibility", SpecializationController.toggleMenuVisibility);
router.delete("/:id", SpecializationController.remove);

export default router;
