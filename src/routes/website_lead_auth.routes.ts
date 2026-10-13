import { Router } from "express";
import * as WebsiteLeadAuthController from "../controllers/website_lead_auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  websiteLeadLoginSchema,
  websiteLeadVerifyOtpSchema,
} from "../validators/website_lead_auth.validator";

const router = Router();

// Public: returning user — phone only → send OTP
router.post(
  "/login",
  validate(websiteLeadLoginSchema),
  WebsiteLeadAuthController.login
);

// Public: verify OTP and return JWT
router.post(
  "/verify-otp",
  validate(websiteLeadVerifyOtpSchema),
  WebsiteLeadAuthController.verifyOtp
);

export default router;
