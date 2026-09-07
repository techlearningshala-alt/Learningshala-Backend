import { Router } from "express";
import * as WhatsAppController from "../controllers/whatsapp.controller";

/**
 * Public Meta webhook routes (no JWT).
 * Mounted at /webhook/whatsapp on the Express app with raw-body capture
 * for X-Hub-Signature-256 verification.
 */
const router = Router();

router.get("/", WhatsAppController.webhookVerify);
router.post("/", WhatsAppController.webhookReceive);

export default router;
