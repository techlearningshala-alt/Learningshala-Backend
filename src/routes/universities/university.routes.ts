import express from "express";
import * as UniversityController from "../../controllers/universities/university.controller";
import * as CourseSearchController from "../../controllers/universities/course-search.controller";
import { upload } from "../../config/multer";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

// Public route for course search (no auth required)
router.get("/search-by-course", CourseSearchController.searchByCourseName);

// Apply auth middleware to all other routes
router.use(authMiddleware);

// Handle image + PDF uploads
router.post(
  "/",
  upload.fields([
    { name: "university_logo", maxCount: 1 },
    { name: "university_brochure", maxCount: 1 },
    ...Array.from({ length: 50 }, (_, i) => ({ name: `banner_image_${i}`, maxCount: 1 })),
    ...Array.from({ length: 100 }, (_, i) => ({ name: `section_image_${i}`, maxCount: 1 })), // Changed to match frontend
  ]),
  UniversityController.create
);

router.put(
  "/:id",
  upload.fields([
    { name: "university_logo", maxCount: 1 },
    { name: "university_brochure", maxCount: 1 },
    ...Array.from({ length: 50 }, (_, i) => ({ name: `banner_image_${i}`, maxCount: 1 })),
    ...Array.from({ length: 100 }, (_, i) => ({ name: `section_image_${i}`, maxCount: 1 })), // Changed to match frontend
  ]),
  UniversityController.update
);
router.get("/list", UniversityController.fetchList);

router.get("/search", UniversityController.search); // Search endpoint (must come before /:university_slug)
router.get("/suggestions", UniversityController.suggestions); // Autocomplete suggestions
router.get("/spell-check", UniversityController.spellCheck); // Spell correction
router.get("/", UniversityController.findAll);
router.get("/:university_slug", UniversityController.findOne);
router.patch("/:id/toggle-status", UniversityController.toggleStatus);
router.patch("/:id/toggle-page-created", UniversityController.togglePageCreated);
router.patch("/:id/toggle-menu-visibility", UniversityController.toggleMenuVisibility);
router.patch("/:id/toggle-provide-emi", UniversityController.toggleProvideEmi);
router.delete("/:id", UniversityController.remove);

export default router;
