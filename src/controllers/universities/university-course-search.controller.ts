import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import { searchUniversitiesByCourseName } from "../../services/universities/university-course-search.service";

/**
 * Search universities by course name
 * GET /api/universities/search-by-course?courseName=online+mba
 */
export const searchByCourseName = async (req: Request, res: Response) => {
  try {
    const courseName = req.query.courseName as string;

    if (!courseName || typeof courseName !== "string" || !courseName.trim()) {
      return errorResponse(
        res,
        "courseName query parameter is required",
        400
      );
    }

    const results = await searchUniversitiesByCourseName(courseName.trim());

    return successResponse(
      res,
      results,
      `Found ${results.length} universit${results.length === 1 ? "y" : "ies"} offering "${courseName}"`
    );
  } catch (error: any) {
    console.error("❌ Error searching universities by course name:", error);
    return errorResponse(
      res,
      error?.message || "Failed to search universities by course name",
      error?.statusCode || 500
    );
  }
};

