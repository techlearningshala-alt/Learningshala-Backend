import { Request, Response } from "express";
import {
  createUniversityCourse,
  deleteUniversityCourse,
  getUniversityCourseById,
  getUniversityCourseBySlug,
  getUniversityCourseByUniversitySlugAndCourseSlug,
  listUniversityCourses,
  toggleUniversityCourseStatus,
  toggleUniversityCoursePageCreated,
  updateUniversityCourse,
} from "../../services/universities/university_course.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";
import { processSectionImages, handleSectionImageRemoval } from "../../utills/sectionImageHandler";
import { 
  indexUniversityCourse, 
  deleteUniversityCourseFromIndex, 
  searchUniversityCourses,
  getUniversityCourseSuggestions,
  getUniversityCourseSpellSuggestions
} from "../../services/elasticsearch/university-course.search.service";

export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const universityId = req.query.university_id
      ? Number(req.query.university_id)
      : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const result = await listUniversityCourses(page, limit, {
      universityId,
      search,
    });

    return successResponse(
      res,
      result,
      "University courses fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university courses:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university courses",
      500
    );
  }
};

export const findOne = async (req: Request, res: Response) => {
  try {
    const slugOrId = String(req.params.slug || "").trim();
    if (!slugOrId) {
      return errorResponse(res, "Course slug or ID is required", 400);
    }

    let course = null;
    const numericId = Number(slugOrId);
    if (!Number.isNaN(numericId) && numericId > 0) {
      course = await getUniversityCourseById(numericId);
    } else {
      course = await getUniversityCourseBySlug(slugOrId);
    }

    if (!course) {
      return errorResponse(res, "University course not found", 404);
    }

    return successResponse(
      res,
      course,
      "University course fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university course:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university course",
      500
    );
  }
};

export const findById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid course ID is required", 400);
    }

    const course = await getUniversityCourseById(id);
    if (!course) {
      return errorResponse(res, "University course not found", 404);
    }

    return successResponse(res, course, "University course fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching university course by ID:", error);
    return errorResponse(res, error.message || "Failed to fetch university course", 500);
  }
};

export const findByUniversityAndSlug = async (req: Request, res: Response) => {
  try {
    const universitySlug = typeof req.params.university_slug === "string" 
      ? req.params.university_slug.trim() 
      : null;
    const courseSlug = typeof req.params.slug === "string" 
      ? req.params.slug.trim() 
      : null;

    if (!universitySlug || universitySlug.length === 0) {
      return errorResponse(res, "University slug is required", 400);
    }

    if (!courseSlug || courseSlug.length === 0) {
      return errorResponse(res, "Course slug is required", 400);
    }

    const course = await getUniversityCourseByUniversitySlugAndCourseSlug(
      universitySlug,
      courseSlug
    );

    if (!course) {
      return errorResponse(res, "University course not found", 404);
    }

    return successResponse(
      res,
      course,
      "University course fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university course:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university course",
      500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const files = req.files as Record<string, Express.Multer.File[]>;
    
    // Normalize files to handle both upload.any() and upload.fields() formats
    const filesObj = Array.isArray(files) 
      ? files.reduce((acc: any, f: any) => {
          acc[f.fieldname] = [f];
          return acc;
        }, {})
      : files;

    if (filesObj?.course_thumbnail?.[0]) {
      const file = filesObj.course_thumbnail[0];
      const fileName = generateFileName(file.originalname);
      body.course_thumbnail = await uploadToS3(
        file.buffer,
        fileName,
        "universities/courses/thumbnails",
        file.mimetype
      );
    }

    if (filesObj?.syllabus_file?.[0]) {
      const file = filesObj.syllabus_file[0];
      const fileName = generateFileName(file.originalname);
      body.syllabus_file = await uploadToS3(
        file.buffer,
        fileName,
        "universities/courses/syllabus",
        file.mimetype
      );
    }

    if (filesObj?.brochure_file?.[0]) {
      const file = filesObj.brochure_file[0];
      const fileName = generateFileName(file.originalname);
      body.brochure_file = await uploadToS3(
        file.buffer,
        fileName,
        "universities/courses/brochures",
        file.mimetype
      );
    } else if (body.brochure_file === "" || body.brochure_file === "null") {
      body.brochure_file = null;
    }

    if (body.banners) {
      try {
        const banners = JSON.parse(body.banners);
        
        // When using upload.any(), files are in an array format
        const filesArray = Array.isArray(files) ? files : Object.values(files).flat();
        
        for (let i = 0; i < banners.length; i++) {
          const bannerKey = `banner_${i}_banner_image`;

          // Find file by fieldname when using upload.any()
          const bannerFile = filesArray.find((f: any) => f.fieldname === bannerKey);
          if (bannerFile) {
            const fileName = generateFileName(bannerFile.originalname);
            banners[i].banner_image = await uploadToS3(
              bannerFile.buffer,
              fileName,
              "universities/courses/banners",
              bannerFile.mimetype
            );
          }
        }
        body.banners = banners;
      } catch (err) {
        console.error("❌ Error parsing banners:", err);
      }
    }

    // Parse sections - handle both string and object cases
    let sections: any[] = [];
    if (body.sections) {
      if (typeof body.sections === "string") {
        try {
          sections = JSON.parse(body.sections);
        } catch (err) {
          console.error("❌ Error parsing sections:", err);
          sections = [];
        }
      } else if (Array.isArray(body.sections)) {
        // Check if array contains JSON strings that need parsing
        if (body.sections.length > 0 && typeof body.sections[0] === "string") {
          // Try to find a valid JSON string in the array (look for one that starts with [)
          let foundValidJson = false;
          for (const item of body.sections) {
            if (typeof item === "string" && item.trim().startsWith("[")) {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].hasOwnProperty("title")) {
                  sections = parsed;
                  foundValidJson = true;
                  break;
                }
              } catch (e) {
                // Continue to next item
              }
            }
          }
          if (!foundValidJson) {
            sections = [];
          }
        } else {
          // It's already an array of objects
          sections = body.sections;
        }
      }
    }

    // 🧩 Handle section images - upload to S3
    await processSectionImages({
      files,
      sections,
      s3BasePath: "universities/courses/sections",
    });

    body.sections = sections;

    const course = await createUniversityCourse(body);
    
    // 🔍 Index university course in Elasticsearch (async, don't wait)
    try {
      await indexUniversityCourse(course);
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }
    
    return successResponse(
      res,
      course,
      "University course created successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating university course:", error);
    return errorResponse(
      res,
      error.message || "Failed to create university course",
      400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await getUniversityCourseById(id);

    if (!existing) {
      return errorResponse(res, "University course not found", 404);
    }

    const body = { ...req.body };
    const files = req.files as Record<string, Express.Multer.File[]>;
    
    // Normalize files to handle both upload.any() and upload.fields() formats
    const filesObj = Array.isArray(files) 
      ? files.reduce((acc: any, f: any) => {
          acc[f.fieldname] = [f];
          return acc;
        }, {})
      : files;

    if (filesObj?.course_thumbnail?.[0]) {
      const file = filesObj.course_thumbnail[0];
      const fileName = generateFileName(file.originalname);
      const newThumbnail = await uploadToS3(
        file.buffer,
        fileName,
        "universities/courses/thumbnails",
        file.mimetype
      );
      body.course_thumbnail = newThumbnail;

      if (
        existing.course_thumbnail &&
        typeof existing.course_thumbnail === "string" &&
        !existing.course_thumbnail.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.course_thumbnail).catch((err) =>
          console.error("Error deleting previous course thumbnail:", err)
        );
      }
    } else if (
      body.course_thumbnail === "" ||
      body.course_thumbnail === "null" ||
      body.course_thumbnail === "__REMOVE__"
    ) {
      body.course_thumbnail = null;
      if (
        existing.course_thumbnail &&
        typeof existing.course_thumbnail === "string" &&
        !existing.course_thumbnail.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.course_thumbnail).catch((err) =>
          console.error("Error deleting previous course thumbnail:", err)
        );
      }
    }

    if (filesObj?.syllabus_file?.[0]) {
      const file = filesObj.syllabus_file[0];
      const fileName = generateFileName(file.originalname);
      const newSyllabus = await uploadToS3(
        file.buffer,
        fileName,
        "universities/courses/syllabus",
        file.mimetype
      );
      body.syllabus_file = newSyllabus;

      if (
        existing.syllabus_file &&
        typeof existing.syllabus_file === "string" &&
        !existing.syllabus_file.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.syllabus_file).catch((err) =>
          console.error("Error deleting previous course syllabus:", err)
        );
      }
    } else if (
      body.syllabus_file === "" ||
      body.syllabus_file === "null" ||
      body.syllabus_file === "__REMOVE__"
    ) {
      body.syllabus_file = null;
      if (
        existing.syllabus_file &&
        typeof existing.syllabus_file === "string" &&
        !existing.syllabus_file.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.syllabus_file).catch((err) =>
          console.error("Error deleting previous course syllabus:", err)
        );
      }
    }

    if (filesObj?.brochure_file?.[0]) {
      const file = filesObj.brochure_file[0];
      const fileName = generateFileName(file.originalname);
      const newBrochure = await uploadToS3(
        file.buffer,
        fileName,
        "universities/courses/brochures",
        file.mimetype
      );
      body.brochure_file = newBrochure;

      if (
        existing.brochure_file &&
        typeof existing.brochure_file === "string" &&
        !existing.brochure_file.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.brochure_file).catch((err) =>
          console.error("Error deleting previous course brochure:", err)
        );
      }
    } else if (
      body.brochure_file === "" ||
      body.brochure_file === "null" ||
      body.brochure_file === "__REMOVE__"
    ) {
      body.brochure_file = null;
      if (
        existing.brochure_file &&
        typeof existing.brochure_file === "string" &&
        !existing.brochure_file.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.brochure_file).catch((err) =>
          console.error("Error deleting previous course brochure:", err)
        );
      }
    }

    if (body.banners) {
      try {
        const banners = JSON.parse(body.banners);
        
        // When using upload.any(), files are in an array format
        const filesArray = Array.isArray(files) ? files : Object.values(files).flat();
        
        for (let i = 0; i < banners.length; i++) {
          const bannerKey = `banner_${i}_banner_image`;

          // Find file by fieldname when using upload.any()
          const bannerFile = filesArray.find((f: any) => f.fieldname === bannerKey);
          if (bannerFile) {
            const fileName = generateFileName(bannerFile.originalname);
            banners[i].banner_image = await uploadToS3(
              bannerFile.buffer,
              fileName,
              "universities/courses/banners",
              bannerFile.mimetype
            );
          }
        }
        body.banners = banners;
      } catch (err) {
        console.error("❌ Error parsing banners:", err);
      }
    }

    // Parse sections - handle both string and object cases
    let sections: any[] = [];
    if (body.sections) {
      if (typeof body.sections === "string") {
        try {
          sections = JSON.parse(body.sections);
        } catch (err) {
          console.error("❌ Error parsing sections:", err);
          sections = [];
        }
      } else if (Array.isArray(body.sections)) {
        // Check if array contains JSON strings that need parsing
        if (body.sections.length > 0 && typeof body.sections[0] === "string") {
          // Try to find a valid JSON string in the array (look for one that starts with [)
          let foundValidJson = false;
          for (const item of body.sections) {
            if (typeof item === "string" && item.trim().startsWith("[")) {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].hasOwnProperty("title")) {
                  sections = parsed;
                  foundValidJson = true;
                  break;
                }
              } catch (e) {
                // Continue to next item
              }
            }
          }
          if (!foundValidJson) {
            sections = [];
          }
        } else {
          // It's already an array of objects
          sections = body.sections;
        }
      }
    }

    // 🧩 Handle section images - upload to S3
    await processSectionImages({
      files,
      sections,
      s3BasePath: "universities/courses/sections",
      existingSections: existing?.sections,
    });
    
    // Handle section image removal (empty strings) even when no new files are uploaded
    handleSectionImageRemoval(sections, existing?.sections);

    body.sections = sections;

    const course = await updateUniversityCourse(id, body);

    // 🔍 Index university course in Elasticsearch (async, don't wait)
    try {
      await indexUniversityCourse(course);
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }

    return successResponse(res, course, "University course updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating university course:", error);
    return errorResponse(
      res,
      error.message || "Failed to update university course",
      400
    );
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteUniversityCourse(id);

    if (!deleted) {
      return errorResponse(res, "University course not found", 404);
    }

    // 🔍 Remove from Elasticsearch index (async, don't wait)
    try {
      await deleteUniversityCourseFromIndex(id);
    } catch (esError) {
      console.error('⚠️ Elasticsearch delete error (non-blocking):', esError);
    }

    return successResponse(res, null, "University course deleted successfully");
  } catch (error: any) {
    console.error("❌ Error deleting university course:", error);
    return errorResponse(
      res,
      error.message || "Failed to delete university course",
      400
    );
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const updated = await toggleUniversityCourseStatus(Number(id), Boolean(is_active));
    if (!updated) return errorResponse(res, "University course not found", 404);
    
    return successResponse(res, updated, "University course status updated successfully");
  } catch (error: any) {
    console.error("❌ Error toggling course status:", error);
    return errorResponse(
      res,
      error.message || "Failed to toggle course status",
      400
    );
  }
};

export const togglePageCreated = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_page_created } = req.body;
    
    const updated = await toggleUniversityCoursePageCreated(Number(id), Boolean(is_page_created));
    if (!updated) return errorResponse(res, "University course not found", 404);
    
    return successResponse(res, updated, "University course page created status updated successfully");
  } catch (error: any) {
    console.error("❌ Error toggling course page created status:", error);
    return errorResponse(
      res,
      error.message || "Failed to toggle course page created status",
      400
    );
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const is_active = req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined;
    const university_id = req.query.university_id ? parseInt(req.query.university_id as string) : undefined;

    const result = await searchUniversityCourses(query, {
      page,
      limit,
      filters: {
        is_active,
        university_id
      }
    });

    return successResponse(res, result, "University courses searched successfully");
  } catch (err: any) {
    console.error('❌ Search error:', err);
    return errorResponse(res, err.message || "Failed to search university courses", 400);
  }
};

export const suggestions = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      return successResponse(res, [], "Suggestions fetched successfully");
    }

    const suggestions = await getUniversityCourseSuggestions(query, limit);
    return successResponse(res, suggestions, "Suggestions fetched successfully");
  } catch (err: any) {
    console.error('❌ Suggestions error:', err);
    return errorResponse(res, err.message || "Failed to get suggestions", 400);
  }
};

export const spellCheck = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';

    if (!query || query.trim().length === 0) {
      return successResponse(res, null, "Spell check completed");
    }

    const suggestion = await getUniversityCourseSpellSuggestions(query);
    return successResponse(res, suggestion, "Spell check completed");
  } catch (err: any) {
    console.error('❌ Spell check error:', err);
    return errorResponse(res, err.message || "Failed to check spelling", 400);
  }
};

