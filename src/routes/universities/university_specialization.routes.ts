import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as UniversitySpecializationController from "../../controllers/universities/university_specialization.controller";
import {
  createUniversitySpecializationSchema,
  updateUniversitySpecializationSchema,
} from "../../validators/universities/university_specialization.validator";
import { upload } from "../../config/multer";

const router = express.Router();

router.use(authMiddleware);

router.get("/", UniversitySpecializationController.findAll);
router.get("/options", UniversitySpecializationController.findOptions);
router.get("/:id", UniversitySpecializationController.findOne);
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  validate(createUniversitySpecializationSchema),
  UniversitySpecializationController.create
);
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  validate(updateUniversitySpecializationSchema),
  UniversitySpecializationController.update
);
router.delete("/:id", UniversitySpecializationController.remove);

export default router;

