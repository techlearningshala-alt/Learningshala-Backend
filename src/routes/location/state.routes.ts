import { Router } from "express";
import * as StateController from "../../controllers/location/state.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", StateController.getAll);

export default router;

