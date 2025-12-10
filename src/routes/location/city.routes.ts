import { Router } from "express";
import * as CityController from "../../controllers/location/city.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/states/:stateId/cities", CityController.getAllByState);

export default router;

