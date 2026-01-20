import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, refreshSchema, verifyOtpSchema } from "../validators/auth.validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
// OTP route (commented out - OTP temporarily disabled)
// router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);
router.post("/refresh", validate(refreshSchema), AuthController.refresh);
router.post("/logout", AuthController.logout); // we accept refreshToken in body
router.get("/me", authMiddleware, AuthController.me);

export default router;
