import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import { searchUniversitiesByCourseName } from "../../services/universities/course-search.service";

/**
 * Search universities by course name
 * GET /api/universities/search-by-course?courseName=online mba
 */
export const searchByCourseName = async (req: Request, res: Response) => {
  try {
    const courseName = req.query.courseName as string;

    if (!courseName || typeof courseName !== "string" || courseName.trim().length === 0) {
      return errorResponse(res, "Course name is required", 400);
    }

    const results = await searchUniversitiesByCourseName(courseName.trim());

    return successResponse(
      res,
      results,
      "Universities fetched successfully!",
      200
    );
  } catch (error: any) {
    console.error("❌ Error in searchByCourseName:", error);
    return errorResponse(
      res,
      error?.message || "Failed to search universities by course name",
      error?.statusCode || 500
    );
  }
};

