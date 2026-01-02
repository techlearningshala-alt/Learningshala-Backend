import { Router } from "express";
import * as UniversityTypesController from "../../controllers/universities/university_types.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createUniversityTypeSchema,
  updateUniversityTypeSchema,
} from "../../validators/universities/university_types.validator";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", UniversityTypesController.list);
router.get("/:id", UniversityTypesController.get);
router.post("/", validate(createUniversityTypeSchema), UniversityTypesController.create);
router.put("/:id", validate(updateUniversityTypeSchema), UniversityTypesController.update);
router.delete("/:id", UniversityTypesController.remove);

export default router;

