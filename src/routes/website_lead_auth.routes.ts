import { Router } from "express";
import * as WebsiteLeadAuthController from "../controllers/website_lead_auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { websiteLeadVerifyOtpSchema } from "../validators/website_lead_auth.validator";

const router = Router();

// Public: verify OTP (after lead create) and return JWT
router.post(
  "/verify-otp",
  validate(websiteLeadVerifyOtpSchema),
  WebsiteLeadAuthController.verifyOtp
);

export default router;
