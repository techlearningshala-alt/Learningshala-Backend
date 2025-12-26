import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as LeadController from "../../controllers/leads/lead.controller";
import { createLeadSchema, updateLeadSchema } from "../../validators/leads/lead.validator";

const router = Router();

router.use(authMiddleware);

router.get("/", LeadController.getLeads);
router.post("/",  LeadController.create);
router.put("/",  LeadController.update);
// router.post("/", LeadController.create);

export default router;

