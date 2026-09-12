import { Router } from "express";
import * as VagmineLeadController from "../controllers/vagmine_lead.controller";
import { validate } from "../middlewares/validate.middleware";
import { createVagmineLeadSchema } from "../validators/vagmine_lead.validator";

const router = Router();

// Public endpoint — save vagmine lead (name, email, number, message)
router.post(
  "/",
  validate(createVagmineLeadSchema),
  VagmineLeadController.create
);

export default router;
