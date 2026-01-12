import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import * as LeadController from "../controllers/lead.controller";
import { createLeadSchema, updateLeadSchema } from "../validators/lead.validator";

const router = Router();

// Protected endpoints (require authentication)
router.use(authMiddleware);
router.post("/", validate(createLeadSchema), LeadController.create);

router.get("/", LeadController.getLeads);
router.put("/", validate(updateLeadSchema), LeadController.update);

export default router;