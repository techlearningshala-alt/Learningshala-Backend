import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import * as LeadController from "../controllers/lead.controller";
import { createLeadSchema } from "../validators/lead.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", LeadController.getLeads);
router.post("/", validate(createLeadSchema), LeadController.create);
// router.post("/", LeadController.create);

export default router;


