import { Router } from "express";
import * as JoinWaitlistController from "../controllers/join_waitlist.controller";
import { validate } from "../middlewares/validate.middleware";
import { createJoinWaitlistSchema } from "../validators/join_waitlist.validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public endpoint
router.post("/", authMiddleware, validate(createJoinWaitlistSchema), JoinWaitlistController.create);

export default router;
