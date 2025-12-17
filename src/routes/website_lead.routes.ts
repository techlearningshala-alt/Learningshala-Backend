import { Router } from "express";
import * as WebsiteLeadController from "../controllers/website_lead.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createWebsiteLeadSchema, verifyOtpSchema } from "../validators/website_lead.validator";

const router = Router();

// Public endpoint to capture website leads (unauthenticated)
router.post("/", validate(createWebsiteLeadSchema), WebsiteLeadController.create);

// Public endpoint to verify OTP by lead ID (unauthenticated)
router.post("/:id/verify-otp", validate(verifyOtpSchema), WebsiteLeadController.verifyOtp);

// Protected endpoint to list website leads (authenticated)
router.get("/", authMiddleware, WebsiteLeadController.getAll);

export default router;

