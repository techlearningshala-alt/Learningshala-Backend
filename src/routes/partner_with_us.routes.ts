import { Router } from "express";
import * as PartnerWithUsController from "../controllers/partner_with_us.controller";
import { validate } from "../middlewares/validate.middleware";
import { externalFormsApiKeyMiddleware } from "../middlewares/external-forms-api-key.middleware";
import { createPartnerWithUsSchema } from "../validators/partner_with_us.validator";

const router = Router();

router.post(
  "/",
  externalFormsApiKeyMiddleware,
  validate(createPartnerWithUsSchema),
  PartnerWithUsController.create
);

export default router;
