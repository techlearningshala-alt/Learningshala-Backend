import { Router } from "express";
import * as ContactUsController from "../controllers/contact_us.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createContactUsSchema } from "../validators/contact_us.validator";

const router = Router();

// Public endpoint to submit contact form (unauthenticated)
router.post("/", validate(createContactUsSchema), ContactUsController.create);

// Protected endpoints to manage contact messages (authenticated)
router.get("/", authMiddleware, ContactUsController.getAll);
router.get("/export", authMiddleware, ContactUsController.exportContactUs);
router.get("/:id", authMiddleware, ContactUsController.getOne);
router.delete("/:id", authMiddleware, ContactUsController.deleteOne);

export default router;

