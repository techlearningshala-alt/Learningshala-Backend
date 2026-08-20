import { Router } from "express";
import * as WebsiteLeadController from "../controllers/website_lead.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../config/multer";
import {
  createWebsiteLeadSchema,
  verifyOtpSchema,
  updateInterestedUniversitySchema,
  updateWebsiteLeadSchema,
} from "../validators/website_lead.validator";

const router = Router();

const leadFileUpload = upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "report", maxCount: 1 },
]);

// Public endpoint to capture website leads (unauthenticated)
// Supports JSON body or multipart/form-data with optional resume + report files
router.post(
  "/",
  leadFileUpload,
  validate(createWebsiteLeadSchema),
  WebsiteLeadController.create
);

// Public endpoint to verify OTP by lead ID (unauthenticated)
router.post("/:id/verify-otp", validate(verifyOtpSchema), WebsiteLeadController.verifyOtp);

// Protected endpoint to list website leads (authenticated)
router.get("/", authMiddleware, WebsiteLeadController.getAll);
router.get("/export", authMiddleware, WebsiteLeadController.exportWebsiteLeads);

router.put(
  "/:id/interested-university",
  authMiddleware,
  validate(updateInterestedUniversitySchema),
  WebsiteLeadController.updateInterestedUniversityById
);

// Public endpoint to update website lead by id (optional resume + report)
router.put(
  "/:id",
  leadFileUpload,
  validate(updateWebsiteLeadSchema),
  WebsiteLeadController.update
);

export default router;
