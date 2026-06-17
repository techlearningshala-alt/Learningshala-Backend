import { Router } from "express";
import * as JoinWaitlistController from "../controllers/join_waitlist.controller";
import { validate } from "../middlewares/validate.middleware";
import { externalFormsApiKeyMiddleware } from "../middlewares/external-forms-api-key.middleware";
import { createJoinWaitlistSchema } from "../validators/join_waitlist.validator";

const router = Router();

router.post(
  "/",
  externalFormsApiKeyMiddleware,
  validate(createJoinWaitlistSchema),
  JoinWaitlistController.create
);

export default router;
