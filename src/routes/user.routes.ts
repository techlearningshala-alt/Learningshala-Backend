import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../validators/user.validator";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all users - Only admin can list users
router.get(
  "/",
  roleMiddleware(["admin"]),
  UserController.getAllUsers
);

// Create user - Only admin can create users
router.post(
  "/",
  roleMiddleware(["admin"]),
  validate(createUserSchema),
  UserController.createUser
);

// Get user by ID
router.get("/:id", UserController.getUser);

// Update user - Only admin can update users
router.put(
  "/:id",
  roleMiddleware(["admin"]),
  validate(createUserSchema.partial()),
  UserController.updateUser
);

// Delete user - Only admin can delete users
router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  UserController.deleteUser
);

export default router;

