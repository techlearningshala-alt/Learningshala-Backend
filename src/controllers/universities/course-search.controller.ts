import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import {searchUniversitiesByCourseSlug } from "../../services/universities/course-search.service";

/**
 * Search universities by course slug
 * GET /api/universities/search-by-course?courseSlug=online-mba
 */
export const searchByCourseSlug = async (req: Request, res: Response) => {
  try {
    const courseSlug = req.query.courseSlug as string;

    if (!courseSlug || typeof courseSlug !== "string" || courseSlug.trim().length === 0) {
      return errorResponse(res, "Course slug is required", 400);
    }

    const results = await searchUniversitiesByCourseSlug(courseSlug.trim());

    return successResponse(
      res,
      results,
      "Universities fetched successfully!",
      200
    );
  } catch (error: any) {
    console.error("❌ Error in searchByCourseSlug:", error);
    return errorResponse(
      res,
      error?.message || "Failed to search universities by course slug",
      error?.statusCode || 500
    );
  }
};

