import { Router } from "express";
import * as SpecializationController from "../../controllers/courses/specialization.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer";

const router = Router();

router.get("/", SpecializationController.getAll);
router.get("/:id", SpecializationController.getOne);
router.post("/",  upload.single("thumbnail"), SpecializationController.create);
router.put("/:id",  upload.single("thumbnail"), SpecializationController.update);
router.delete("/:id", SpecializationController.remove);

export default router;
