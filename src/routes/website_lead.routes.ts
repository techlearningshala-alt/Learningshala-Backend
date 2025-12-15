import { Router } from "express";
import * as WebsiteLeadController from "../controllers/website_lead.controller";
import { validate } from "../middlewares/validate.middleware";
import { createWebsiteLeadSchema } from "../validators/website_lead.validator";

const router = Router();

// Public endpoint to capture website leads (unauthenticated)
router.post("/", validate(createWebsiteLeadSchema), WebsiteLeadController.create);

export default router;

