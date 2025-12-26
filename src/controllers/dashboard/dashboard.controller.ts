import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../../services/dashboard/dashboard.service";
import { successResponse, errorResponse } from "../../utills/response";

/**
 * Get complete dashboard data (statistics, recent activity, today/week stats)
 */
export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = (req as any).user?.role;
    const data = await DashboardService.getDashboardData(userRole);
    return successResponse(res, data, "Dashboard data fetched successfully");
  } catch (error: any) {
    console.error("❌ Error in getDashboardData controller:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch dashboard data",
      error?.statusCode || 500
    );
  }
};

/**
 * Get only statistics
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = (req as any).user?.role;
    const statistics = await DashboardService.getStatistics(userRole);
    return successResponse(res, statistics, "Statistics fetched successfully");
  } catch (error: any) {
    console.error("❌ Error in getStatistics controller:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch statistics",
      error?.statusCode || 500
    );
  }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = (req as any).user?.role;
    const recentActivity = await DashboardService.getRecentActivity(userRole);
    return successResponse(
      res,
      recentActivity,
      "Recent activity fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error in getRecentActivity controller:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch recent activity",
      error?.statusCode || 500
    );
  }
};

