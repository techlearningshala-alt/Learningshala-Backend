import { Router } from "express";
import * as PartnerWithUsController from "../controllers/partner_with_us.controller";
import { validate } from "../middlewares/validate.middleware";
import { createPartnerWithUsSchema } from "../validators/partner_with_us.validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public endpoint
router.post("/", authMiddleware, validate(createPartnerWithUsSchema), PartnerWithUsController.create);

export default router;
