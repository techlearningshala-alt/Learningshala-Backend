import { Router } from "express";
import * as DashboardController from "../../controllers/dashboard/dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// Get complete dashboard data
router.get("/", DashboardController.getDashboardData);

// Get only statistics
router.get("/statistics", DashboardController.getStatistics);

// Get recent activity
router.get("/recent-activity", DashboardController.getRecentActivity);

export default router;

