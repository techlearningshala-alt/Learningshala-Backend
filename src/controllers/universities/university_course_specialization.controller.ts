import { Request, Response } from "express";
import {
  createUniversityCourseSpecialization,
  deleteUniversityCourseSpecialization,
  getUniversityCourseSpecializationById,
  getUniversityCourseSpecializationBySlug,
  listUniversityCourseSpecializations,
  toggleUniversityCourseSpecializationStatus,
  updateUniversityCourseSpecialization,
} from "../../services/universities/university_course_specialization.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";
import { processSectionImages, handleSectionImageRemoval } from "../../utills/sectionImageHandler";

export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const universityId = req.query.university_id
      ? Number(req.query.university_id)
      : undefined;
    const universityCourseId = req.query.university_course_id
      ? Number(req.query.university_course_id)
      : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const result = await listUniversityCourseSpecializations(page, limit, {
      universityId,
      universityCourseId,
      search,
    });

    return successResponse(
      res,
      result,
      "University course specializations fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university course specializations:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university course specializations",
      500
    );
  }
};

export const findOne = async (req: Request, res: Response) => {
  try {
    const slugOrId = String(req.params.slug || "").trim();
    if (!slugOrId) {
      return errorResponse(res, "Specialization slug or ID is required", 400);
    }

    let specialization = null;
    const numericId = Number(slugOrId);
    if (!Number.isNaN(numericId) && numericId > 0) {
      specialization = await getUniversityCourseSpecializationById(numericId);
    } else {
      specialization = await getUniversityCourseSpecializationBySlug(slugOrId);
    }

    if (!specialization) {
      return errorResponse(res, "University course specialization not found", 404);
    }

    return successResponse(
      res,
      specialization,
      "University course specialization fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university course specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university course specialization",
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
        "universities/course-specializations/thumbnails",
        file.mimetype
      );
    }

    if (filesObj?.syllabus_file?.[0]) {
      const file = filesObj.syllabus_file[0];
      const fileName = generateFileName(file.originalname);
      body.syllabus_file = await uploadToS3(
        file.buffer,
        fileName,
        "universities/course-specializations/syllabus",
        file.mimetype
      );
    }

    if (filesObj?.brochure_file?.[0]) {
      const file = filesObj.brochure_file[0];
      const fileName = generateFileName(file.originalname);
      body.brochure_file = await uploadToS3(
        file.buffer,
        fileName,
        "universities/course-specializations/brochures",
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
              "universities/course-specializations/banners",
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
      s3BasePath: "universities/course-specializations/sections",
    });

    body.sections = sections;

    const specialization = await createUniversityCourseSpecialization(body);
    return successResponse(
      res,
      specialization,
      "University course specialization created successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating university course specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to create university course specialization",
      400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await getUniversityCourseSpecializationById(id);

    if (!existing) {
      return errorResponse(res, "University course specialization not found", 404);
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
        "universities/course-specializations/thumbnails",
        file.mimetype
      );
      body.course_thumbnail = newThumbnail;

      if (
        existing.course_thumbnail &&
        typeof existing.course_thumbnail === "string" &&
        !existing.course_thumbnail.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.course_thumbnail).catch((err) =>
          console.error("Error deleting previous specialization thumbnail:", err)
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
          console.error("Error deleting previous specialization thumbnail:", err)
        );
      }
    }

    if (filesObj?.syllabus_file?.[0]) {
      const file = filesObj.syllabus_file[0];
      const fileName = generateFileName(file.originalname);
      const newSyllabus = await uploadToS3(
        file.buffer,
        fileName,
        "universities/course-specializations/syllabus",
        file.mimetype
      );
      body.syllabus_file = newSyllabus;

      if (
        existing.syllabus_file &&
        typeof existing.syllabus_file === "string" &&
        !existing.syllabus_file.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.syllabus_file).catch((err) =>
          console.error("Error deleting previous specialization syllabus:", err)
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
          console.error("Error deleting previous specialization syllabus:", err)
        );
      }
    }

    if (filesObj?.brochure_file?.[0]) {
      const file = filesObj.brochure_file[0];
      const fileName = generateFileName(file.originalname);
      const newBrochure = await uploadToS3(
        file.buffer,
        fileName,
        "universities/course-specializations/brochures",
        file.mimetype
      );
      body.brochure_file = newBrochure;

      if (
        existing.brochure_file &&
        typeof existing.brochure_file === "string" &&
        !existing.brochure_file.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.brochure_file).catch((err) =>
          console.error("Error deleting previous specialization brochure:", err)
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
          console.error("Error deleting previous specialization brochure:", err)
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
              "universities/course-specializations/banners",
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
      s3BasePath: "universities/course-specializations/sections",
      existingSections: existing?.sections,
    });
    
    // Handle section image removal (empty strings) even when no new files are uploaded
    handleSectionImageRemoval(sections, existing?.sections);

    body.sections = sections;

    const specialization = await updateUniversityCourseSpecialization(id, body);

    return successResponse(
      res,
      specialization,
      "University course specialization updated successfully"
    );
  } catch (error: any) {
    console.error("❌ Error updating university course specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to update university course specialization",
      400
    );
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const isActive = req.body.is_active === true || req.body.is_active === "true" || req.body.is_active === 1;

    const specialization = await toggleUniversityCourseSpecializationStatus(id, isActive);

    if (!specialization) {
      return errorResponse(res, "University course specialization not found", 404);
    }

    return successResponse(
      res,
      specialization,
      "University course specialization status toggled successfully"
    );
  } catch (error: any) {
    console.error("❌ Error toggling university course specialization status:", error);
    return errorResponse(
      res,
      error.message || "Failed to toggle university course specialization status",
      400
    );
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteUniversityCourseSpecialization(id);

    if (!deleted) {
      return errorResponse(res, "University course specialization not found", 404);
    }

    return successResponse(
      res,
      null,
      "University course specialization deleted successfully"
    );
  } catch (error: any) {
    console.error("❌ Error deleting university course specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to delete university course specialization",
      400
    );
  }
};
