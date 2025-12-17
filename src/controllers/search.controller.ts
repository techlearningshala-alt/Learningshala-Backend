import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { unifiedSearch, UnifiedSearchOptions } from "../services/elasticsearch/unified.search.service";

/**
 * Unified Search Controller
 * Handles search across all entities (universities, courses, university courses, specializations, university course specializations)
 */
export const search = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Parse filters from query parameters
    const filters: UnifiedSearchOptions['filters'] = {};

    // University filters
    if (req.query.university_is_active !== undefined) {
      filters.university_is_active = req.query.university_is_active === 'true';
    }
    if (req.query.university_approval_id) {
      filters.university_approval_id = parseInt(req.query.university_approval_id as string);
    }

    // Course filters
    if (req.query.course_is_active !== undefined) {
      filters.course_is_active = req.query.course_is_active === 'true';
    }
    if (req.query.course_domain_id) {
      filters.course_domain_id = parseInt(req.query.course_domain_id as string);
    }

    // University course filters
    if (req.query.university_course_is_active !== undefined) {
      filters.university_course_is_active = req.query.university_course_is_active === 'true';
    }
    if (req.query.university_course_university_id) {
      filters.university_course_university_id = parseInt(req.query.university_course_university_id as string);
    }

    // Specialization filters
    if (req.query.specialization_is_active !== undefined) {
      filters.specialization_is_active = req.query.specialization_is_active === 'true';
    }
    if (req.query.specialization_course_id) {
      filters.specialization_course_id = parseInt(req.query.specialization_course_id as string);
    }

    // University course specialization filters
    if (req.query.university_course_specialization_university_course_id) {
      filters.university_course_specialization_university_course_id = parseInt(
        req.query.university_course_specialization_university_course_id as string
      );
    }

    const options: UnifiedSearchOptions = {
      page,
      limit,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    };

    const result = await unifiedSearch(query, options);

    // Return array directly in data field, with total and took at top level
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Search completed successfully",
      data: result.data,
      total: result.total,
      took: result.took
    });
  } catch (err: any) {
    console.error('❌ Unified search error:', err);
    return errorResponse(res, err.message || "Failed to perform search", 400);
  }
};

