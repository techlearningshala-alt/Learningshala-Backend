import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", validate(refreshSchema), AuthController.refresh);
router.post("/logout", AuthController.logout); // we accept refreshToken in body
router.get("/me", authMiddleware, AuthController.me);

export default router;
