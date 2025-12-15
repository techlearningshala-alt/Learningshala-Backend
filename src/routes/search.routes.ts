import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as SearchController from "../controllers/search.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Unified search endpoint - searches across all entities
router.get("/", SearchController.search);

export default router;

