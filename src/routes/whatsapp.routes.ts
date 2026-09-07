import { Router } from "express";
import * as WhatsAppController from "../controllers/whatsapp.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createWhatsAppUniversitySchema,
  sendWhatsAppMessageSchema,
  updateConversationStatusSchema,
  updateWhatsAppUniversitySchema,
} from "../validators/whatsapp.validator";

const router = Router();

// Admin-only inbox APIs
router.use(authMiddleware, roleMiddleware(["admin"]));

/**
 * WhatsApp university accounts
 * After Meta Embedded Signup, POST here with phone_number_id + waba_id
 * so webhooks and send-as-university use the correct number.
 */
router.get("/universities", WhatsAppController.listUniversities);
router.post(
  "/universities",
  validate(createWhatsAppUniversitySchema),
  WhatsAppController.createUniversity
);
router.put(
  "/universities/:id",
  validate(updateWhatsAppUniversitySchema),
  WhatsAppController.updateUniversity
);

router.get("/conversations", WhatsAppController.listConversations);
router.get("/conversations/:id", WhatsAppController.getConversationThread);
router.post(
  "/conversations/:id/messages",
  validate(sendWhatsAppMessageSchema),
  WhatsAppController.sendMessage
);
router.patch(
  "/conversations/:id/status",
  validate(updateConversationStatusSchema),
  WhatsAppController.updateConversationStatus
);

export default router;
