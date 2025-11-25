import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as UniversityCourseSpecializationController from "../../controllers/universities/university_course_specialization.controller";
import {
  createUniversityCourseSpecializationSchema,
  updateUniversityCourseSpecializationSchema,
} from "../../validators/universities/university_course_specialization.validator";
import { upload } from "../../config/multer";

const router = express.Router();

router.use(authMiddleware);

// Specific routes must come before generic parameter routes
router.get("/", UniversityCourseSpecializationController.findAll);
router.get("/:university_slug/:course_slug/:slug", UniversityCourseSpecializationController.findByCourseAndSlug);
// router.get("/:slug", UniversityCourseSpecializationController.findOne);
router.post(
  "/",
  upload.any(),
  validate(createUniversityCourseSpecializationSchema),
  UniversityCourseSpecializationController.create
);
router.put(
  "/:id",
  upload.any(),
  validate(updateUniversityCourseSpecializationSchema),
  UniversityCourseSpecializationController.update
);
router.patch("/:id/toggle-status", UniversityCourseSpecializationController.toggleStatus);
router.delete("/:id", UniversityCourseSpecializationController.remove);

export default router;

