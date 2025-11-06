import { Router } from "express";
import * as TestimonialController from "../controllers/student_testimonial.controller";
import { validate } from "../middlewares/validate.middleware";
import { upload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", TestimonialController.getAll);
router.get("/:id", TestimonialController.getOne);
router.post("/", upload.single("thumbnail"), TestimonialController.create);
router.put("/:id", upload.single("thumbnail"), TestimonialController.update);
router.delete("/:id", TestimonialController.remove);

export default router;
