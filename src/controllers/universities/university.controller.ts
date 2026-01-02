import { Request, Response } from "express";
import slugify from "slugify";
import {
  createUniversitySchema,
  updateUniversitySchema,
} from "../../validators/universities/university.validator";
import { successResponse, errorResponse } from "../../utills/response";
import * as UniversityService from "../../services/universities/university.service";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";
import { processSectionImages, handleSectionImageRemoval } from "../../utills/sectionImageHandler";
import { UniversityRepo } from "../../repositories/universities/university.repository";
import { 
  indexUniversity, 
  deleteUniversityFromIndex, 
  searchUniversities,
  getUniversitySuggestions,
  getSpellSuggestions
} from "../../services/elasticsearch/university.search.service";
import pool from "../../config/db";

export const create = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const files = req.files as any;

    // ✅ handle known top-level fields - upload to S3
    if (files?.university_logo?.[0]) {
      const fileName = generateFileName(files.university_logo[0].originalname);
      body.university_logo = await uploadToS3(
        files.university_logo[0].buffer,
        fileName,
        "universities/logo",
        files.university_logo[0].mimetype
      );
    }

    if (files?.university_brochure?.[0]) {
      const fileName = generateFileName(files.university_brochure[0].originalname);
      body.university_brochure = await uploadToS3(
        files.university_brochure[0].buffer,
        fileName,
        "universities/brochure",
        files.university_brochure[0].mimetype
      );
    }

    body.university_slug = slugify(body.university_slug, { lower: true, strict: true });
    body.is_active = Boolean(body.is_active);

    // ✅ Parse banners & sections safely
    const banners = body.banners ? JSON.parse(body.banners) : [];
    const sections = body.sections ? JSON.parse(body.sections) : [];

    // ✅ Handle multiple banner images (banner_image_0, banner_image_1, etc.) - upload to S3
    if (files && typeof files === "object") {
      const bannerKeys = Object.keys(files).filter((key) => key.startsWith("banner_image_"));
      console.log("🟢 [CREATE] Banner image keys found:", bannerKeys);
      for (const key of bannerKeys) {
        const index = Number(key.split("_")[2]);
        console.log(`🟢 [CREATE] Processing ${key}, index: ${index}, banner exists: ${!!banners[index]}`);
        if (!isNaN(index) && banners[index]) {
          const file = files[key][0];
          const fileName = generateFileName(file.originalname);
          const s3Key = await uploadToS3(
            file.buffer,
            fileName,
            "universities/banners",
            file.mimetype
          );
          banners[index].banner_image = s3Key;
          console.log(`✅ [CREATE] Mapped ${key} to banner[${index}]: ${s3Key}`);
          console.log(`🔍 [CREATE] Banner[${index}] object after assignment:`, JSON.stringify(banners[index], null, 2));
        } else {
          console.log(`⚠️ [CREATE] Skipping ${key} - index ${index} is invalid or banner[${index}] doesn't exist`);
        }
      }
    }

        // 🧩 Handle section images with unique keys (section_image_0, section_image_1, etc.) - upload to S3
    await processSectionImages({
      files,
      sections,
      s3BasePath: "universities/sections",
      enableLogging: true,
    });

    // 🧾 Handle placement partners
    if (body.placement_partner_ids && typeof body.placement_partner_ids === "string") {
      try {
        const parsed = JSON.parse(body.placement_partner_ids);
        body.placement_partner_ids = Array.isArray(parsed) ? JSON.stringify(parsed) : "[]";
      } catch {
        body.placement_partner_ids = "[]";
      }
    }

    // 🧾 Handle EMI partners
    if (body.emi_partner_ids && typeof body.emi_partner_ids === "string") {
      try {
        const parsed = JSON.parse(body.emi_partner_ids);
        body.emi_partner_ids = Array.isArray(parsed) ? JSON.stringify(parsed) : "[]";
      } catch {
        body.emi_partner_ids = "[]";
      }
    }

    console.log("🟢 Final body:", body);
    console.log("🟢 Final banners:", banners);

    // ✅ Save university
    const university = await UniversityService.UniversityService.addUniversity(body, banners, sections);

    // 🔍 Index university in Elasticsearch (async, don't wait)
    try {
      const [bannersData]: any = await pool.query(
        `SELECT * FROM university_banners WHERE university_id = ?`,
        [university.id]
      );
      const [sectionsData]: any = await pool.query(
        `SELECT * FROM university_sections WHERE university_id = ?`,
        [university.id]
      );
      await indexUniversity({
        ...university,
        banners: bannersData,
        sections: sectionsData
      });
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }

    return successResponse(res, university, "University created successfully", 201);
  } catch (err: any) {
    console.error("❌ Create university error:", err);
    return errorResponse(res, err.message || "Failed to create university", 400);
  }
};


export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = { ...req.body};
console.log(body,"body")
    const saveDateFlag = body.saveWithDate === "true";

    // Parse banners and sections
    const banners = body.banners ? JSON.parse(body.banners) : [];
    const sections = body.sections ? JSON.parse(body.sections) : [];

    const files = req.files as any
console.log(files,"filesbefore")
    // Get current university to delete old files from S3
    const currentUniversity: any = await UniversityRepo.getUniversityById(Number(id));

    // 🎓 University-level files - upload to S3 or handle removal
    if (files?.university_logo?.[0]) {
      const fileName = generateFileName(files.university_logo[0].originalname);
      body.university_logo = await uploadToS3(
        files.university_logo[0].buffer,
        fileName,
        "universities/logo",
        files.university_logo[0].mimetype
      );

      // Delete old logo from S3 if it exists and is not a local path
      if (currentUniversity?.university_logo && typeof currentUniversity.university_logo === "string" && !currentUniversity.university_logo.startsWith("/uploads/")) {
        await deleteFromS3(currentUniversity.university_logo);
      }
    } else if (body.university_logo === "" || body.university_logo === "null") {
      // Image was removed - delete from S3 and set to null
      console.log("🗑️ [BACKEND] University logo removal detected");
      console.log("🗑️ [BACKEND] body.university_logo:", body.university_logo);
      console.log("🗑️ [BACKEND] currentUniversity.university_logo:", currentUniversity?.university_logo);
      if (currentUniversity?.university_logo && typeof currentUniversity.university_logo === "string" && !currentUniversity.university_logo.startsWith("/uploads/")) {
        console.log("🗑️ [BACKEND] Deleting logo from S3:", currentUniversity.university_logo);
        await deleteFromS3(currentUniversity.university_logo);
      }
      body.university_logo = null;
      console.log("🗑️ [BACKEND] Set body.university_logo to null");
    } else {
      console.log("📝 [BACKEND] No logo change - keeping existing:", currentUniversity?.university_logo);
    }

    if (files?.university_brochure?.[0]) {
      const fileName = generateFileName(files.university_brochure[0].originalname);
      body.university_brochure = await uploadToS3(
        files.university_brochure[0].buffer,
        fileName,
        "universities/brochure",
        files.university_brochure[0].mimetype
      );

      // Delete old brochure from S3 if it exists and is not a local path
      if (currentUniversity?.university_brochure && typeof currentUniversity.university_brochure === "string" && !currentUniversity.university_brochure.startsWith("/uploads/")) {
        await deleteFromS3(currentUniversity.university_brochure);
      }
    }

    // 🖼️ Handle multiple banner images (banner_image_0, banner_image_1, etc.) - upload to S3
    if (files && typeof files === "object") {
      const bannerKeys = Object.keys(files).filter((key) => key.startsWith("banner_image_"));
      console.log("🟢 Banner image keys found:", bannerKeys);
      for (const key of bannerKeys) {
        const index = Number(key.split("_")[2]);
        if (!isNaN(index) && banners[index]) {
          const file = files[key][0];
          const fileName = generateFileName(file.originalname);
          banners[index].banner_image = await uploadToS3(
            file.buffer,
            fileName,
            "universities/banners",
            file.mimetype
          );
          console.log(`🟢 Mapped ${key} to banner[${index}]: ${banners[index].banner_image}`);
        }
      }
    }
    
    // Handle banner image removal (empty string in banner_image field)
    console.log("📤 [BACKEND] Processing banners for removal check");
    console.log("📤 [BACKEND] banners array:", JSON.stringify(banners, null, 2));
    console.log("📤 [BACKEND] currentUniversity.banners:", JSON.stringify(currentUniversity?.banners, null, 2));
    banners.forEach((banner: any, index: number) => {
      console.log(`📤 [BACKEND] Banner ${index}:`, JSON.stringify(banner, null, 2));
      if (banner.banner_image === "" || banner.banner_image === "null") {
        console.log(`🗑️ [BACKEND] Banner ${index} image removal detected`);
        // Find existing banner to delete from S3
        const existingBanner = currentUniversity?.banners?.[index];
        console.log(`🗑️ [BACKEND] Existing banner ${index}:`, existingBanner);
        if (existingBanner?.banner_image && typeof existingBanner.banner_image === "string" && !existingBanner.banner_image.startsWith("/uploads/")) {
          console.log(`🗑️ [BACKEND] Deleting banner ${index} from S3:`, existingBanner.banner_image);
          deleteFromS3(existingBanner.banner_image).catch(err => console.error("Error deleting banner from S3:", err));
        }
        banner.banner_image = null;
        console.log(`🗑️ [BACKEND] Set banner ${index}.banner_image to null`);
      } else {
        console.log(`📝 [BACKEND] Banner ${index} - no removal (value: "${banner.banner_image}")`);
      }
    });
    console.log("📤 [BACKEND] Final banners after removal processing:", JSON.stringify(banners, null, 2));
    
      // 🧩 Handle section images like Add API - upload to S3
    await processSectionImages({
      files,
      sections,
      s3BasePath: "universities/sections",
      existingSections: currentUniversity?.sections,
    });
    
    // Handle section image removal (empty strings) even when no new files are uploaded
    handleSectionImageRemoval(sections, currentUniversity?.sections);
    // 🧾 Handle approvals
    if (body.approval_id && typeof body.approval_id === "string") {
      try {
        const parsed = JSON.parse(body.approval_id);
        body.approval_id = Array.isArray(parsed) ? JSON.stringify(parsed) : "[]";
      } catch {
        body.approval_id = "[]";
      }
    }

    // 🧾 Handle placement partners
    if (body.placement_partner_ids && typeof body.placement_partner_ids === "string") {
      try {
        const parsed = JSON.parse(body.placement_partner_ids);
        body.placement_partner_ids = Array.isArray(parsed) ? JSON.stringify(parsed) : "[]";
      } catch {
        body.placement_partner_ids = "[]";
      }
    }

    // 🧾 Handle EMI partners
    if (body.emi_partner_ids && typeof body.emi_partner_ids === "string") {
      try {
        const parsed = JSON.parse(body.emi_partner_ids);
        body.emi_partner_ids = Array.isArray(parsed) ? JSON.stringify(parsed) : "[]";
      } catch {
        body.emi_partner_ids = "[]";
      }
    }

    body.university_slug = slugify(body.university_slug, { lower: true, strict: true });
    // ✅ Validate and prepare update
    const validated: any =({
      ...body,
      banners,
      sections,
    });
    const { banners: validBanners = [], sections: validSections = [], ...updateData } = validated;
    console.log(files,"filesafter")

    // 💾 Save to DB
    const updated = await UniversityService.updateUniversity(
      Number(id),
      updateData,
      validBanners,
      validSections
    );

    if (!updated) return errorResponse(res, "University not found", 404);

    // 🔍 Index university in Elasticsearch (async, don't wait)
    try {
      const [bannersData]: any = await pool.query(
        `SELECT * FROM university_banners WHERE university_id = ?`,
        [Number(id)]
      );
      const [sectionsData]: any = await pool.query(
        `SELECT * FROM university_sections WHERE university_id = ?`,
        [Number(id)]
      );
      await indexUniversity({
        ...updated,
        banners: bannersData,
        sections: sectionsData
      });
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }

    return successResponse(res, updated, "University updated successfully");
  } catch (err: any) {
    console.error("❌ University update error:", err);
    return errorResponse(res, err.message || "Failed to update university", 400);
  }
};

export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const university_type_id = req.query.university_type_id ? parseInt(req.query.university_type_id as string) : undefined;
    const result = await UniversityService.getAllUniversities(page, limit, university_type_id);
    return successResponse(res, result, "Universities fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch universities", 400);
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const is_active = req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined;
    const approval_id = req.query.approval_id ? parseInt(req.query.approval_id as string) : undefined;

    const result = await searchUniversities(query, {
      page,
      limit,
      filters: {
        is_active,
        approval_id
      }
    });

    return successResponse(res, result, "Universities searched successfully");
  } catch (err: any) {
    console.error('❌ Search error:', err);
    return errorResponse(res, err.message || "Failed to search universities", 400);
  }
};

export const suggestions = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      return successResponse(res, [], "Suggestions fetched successfully");
    }

    const suggestions = await getUniversitySuggestions(query, limit);
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

    const suggestion = await getSpellSuggestions(query);
    return successResponse(res, suggestion, "Spell check completed");
  } catch (err: any) {
    console.error('❌ Spell check error:', err);
    return errorResponse(res, err.message || "Failed to check spelling", 400);
  }
};

export const findOne = async (req: Request, res: Response) => {
  try {
    const university = await UniversityService.getUniversityBySlug(req.params.university_slug);
    if (!university) return errorResponse(res, "University not found", 404);
    return successResponse(res, university, "University fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch university", 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const universityId = Number(req.params.id);
    const deleted = await UniversityService.deleteUniversity(universityId);
    if (!deleted) return errorResponse(res, "University not found", 404);
    
    // 🔍 Remove from Elasticsearch index (async, don't wait)
    try {
      await deleteUniversityFromIndex(universityId);
    } catch (esError) {
      console.error('⚠️ Elasticsearch delete error (non-blocking):', esError);
    }
    
    return successResponse(res, null, "University deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete university", 400);
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const updated = await UniversityService.toggleUniversityStatus(Number(id), Boolean(is_active));
    if (!updated) return errorResponse(res, "University not found", 404);
    
    return successResponse(res, updated, "University status updated successfully");
  } catch (err: any) {
    console.error("❌ Toggle status error:", err);
    return errorResponse(res, err.message || "Failed to toggle status", 400);
  }
};

export const togglePageCreated = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_page_created } = req.body;
    
    const updated = await UniversityService.toggleUniversityPageCreated(Number(id), Boolean(is_page_created));
    if (!updated) return errorResponse(res, "University not found", 404);
    
    return successResponse(res, updated, "University page visibility updated successfully");
  } catch (err: any) {
    console.error("❌ Toggle page created error:", err);
    return errorResponse(res, err.message || "Failed to toggle page visibility", 400);
  }
};

export const fetchList = async (req: Request, res: Response) => {
  try {
    console.log("fetchList");
    const universities = await UniversityService.fetchUniversitiesList();
    return successResponse(res, universities, "Universities list fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch universities list", 400);
  }
};