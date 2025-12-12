import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as UniversityCourseController from "../../controllers/universities/university_course.controller";
import {
  createUniversityCourseSchema,
  updateUniversityCourseSchema,
} from "../../validators/universities/university_course.validator";
import { upload } from "../../config/multer";

const router = express.Router();

router.use(authMiddleware);

// Specific routes must come before generic parameter routes
router.get("/", UniversityCourseController.findAll);
router.get("/search", UniversityCourseController.search); // Search endpoint (must come before /:id)
router.get("/suggestions", UniversityCourseController.suggestions); // Autocomplete suggestions
router.get("/spell-check", UniversityCourseController.spellCheck); // Spell correction
router.get("/id/:id", UniversityCourseController.findById);
router.get("/:university_slug/:slug", UniversityCourseController.findByUniversityAndSlug);
router.post(
  "/",
  upload.any(),
  validate(createUniversityCourseSchema),
  UniversityCourseController.create
);
router.put(
  "/:id",
  upload.any(),
  validate(updateUniversityCourseSchema),
  UniversityCourseController.update
);
router.patch("/:id/toggle-status", UniversityCourseController.toggleStatus);
router.patch("/:id/toggle-page-created", UniversityCourseController.togglePageCreated);
router.delete("/:id", UniversityCourseController.remove);

export default router;

