import { Request, Response } from "express";
import {
  createUniversityCourse,
  deleteUniversityCourse,
  getUniversityCourseById,
  getUniversityCourseBySlug,
  getUniversityCourseByUniversityIdAndSlug,
  listUniversityCourses,
  toggleUniversityCourseStatus,
  updateUniversityCourse,
} from "../../services/universities/university_course.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

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
    // Check if this might be a two-segment URL that should match the university_id/slug route
    const slugOrId = String(req.params.slug || "").trim();
    const pathSegments = req.path.split("/").filter(Boolean);
    
    // If there are 2 segments in the path, this route shouldn't have matched
    // It means Express matched :slug to the first segment incorrectly
    if (pathSegments.length === 2 && req.params.university_id === undefined) {
      // Try to call the correct handler
      const universityId = Number(pathSegments[0]);
      const slug = pathSegments[1];
      
      if (!Number.isNaN(universityId) && universityId > 0 && slug) {
        const course = await getUniversityCourseByUniversityIdAndSlug(universityId, slug);
        if (course) {
          return successResponse(res, course, "University course fetched successfully");
        }
      }
    }
    
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

export const findByUniversityAndSlug = async (req: Request, res: Response) => {
  try {
    const universityId = req.params.university_id
      ? Number(req.params.university_id)
      : null;
    const slug = typeof req.params.slug === "string" ? req.params.slug.trim() : null;
    console.log(universityId, slug,"universityId and slug");

    if (!universityId || universityId <= 0 || Number.isNaN(universityId)) {
      return errorResponse(res, "Valid university_id is required", 400);
    }

    if (!slug || slug.length === 0) {
      return errorResponse(res, "Course slug is required", 400);
    }
    const course = await getUniversityCourseByUniversityIdAndSlug(
      universityId,
      slug
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

    const course = await createUniversityCourse(body);
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

    const course = await updateUniversityCourse(id, body);

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

