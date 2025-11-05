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
import { UniversityRepo } from "../../repositories/universities/university.repository";

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
        }
      }
    }

        // 🧩 Handle section images with unique keys (section_image_0, section_image_1, etc.) - upload to S3
    if (files && typeof files === "object") {
      const sectionImageKeys = Object.keys(files).filter((key) => key.startsWith("section_image_"));
      console.log("🟢 [CREATE] Section image keys found:", sectionImageKeys);

      if (sectionImageKeys.length > 0) {
        // Build map from original filename → S3 URL
        const fileMap = new Map();
        for (const key of sectionImageKeys) {
          const file = files[key][0];
          const fileName = generateFileName(file.originalname);
          const s3Url = await uploadToS3(
            file.buffer,
            fileName,
            "universities/sections",
            file.mimetype
          );
          console.log(`🔍 [CREATE] File details for ${key}:`, {
            originalname: file.originalname,
            s3Url: s3Url
          });
          fileMap.set(file.originalname, s3Url);
        }
    
        console.log("🔍 [CREATE] FileMap contents:", Array.from(fileMap.entries()));
        console.log("🔍 [CREATE] Sections BEFORE replacement:", JSON.stringify(sections, null, 2));
    
        const replaceSectionImages = (obj: any) => {
          Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === "string" && fileMap.has(val)) {
              console.log(`✅ [CREATE] Replacing ${key}: "${val}" → "${fileMap.get(val)}"`);
              obj[key] = fileMap.get(val);
            } else if (typeof val === "string" && (val.includes('.webp') || val.includes('.jpg') || val.includes('.png'))) {
              console.log(`⚠️ [CREATE] Found image filename but NOT in fileMap: ${key} = "${val}"`);
            }
            
            if (Array.isArray(val)) {
              val.forEach((item) => replaceSectionImages(item));
            } else if (val && typeof val === "object") {
              replaceSectionImages(val);
            }
          });
        };
    
        sections.forEach((section: any) => {
          if (section.props) replaceSectionImages(section.props);
        });
    
        console.log("🔍 [CREATE] Sections AFTER replacement:", JSON.stringify(sections, null, 2));
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

    console.log("🟢 Final body:", body);
    console.log("🟢 Final banners:", banners);

    // ✅ Save university
    const university = await UniversityService.UniversityService.addUniversity(body, banners, sections);

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

    // Get current university to delete old files from S3
    const currentUniversity: any = await UniversityRepo.getUniversityById(Number(id));

    // 🎓 University-level files - upload to S3
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
    
      // 🧩 Handle section images like Add API - upload to S3
    if (files && typeof files === "object") {
      const sectionImageKeys = Object.keys(files).filter((key) => key.startsWith("section_image_"));
      console.log("🟢 Section image keys found:", sectionImageKeys);

      if (sectionImageKeys.length > 0) {
        // Build map from original filename → S3 URL
        const fileMap = new Map();
        for (const key of sectionImageKeys) {
          const file = files[key][0];
          const fileName = generateFileName(file.originalname);
          const s3Url = await uploadToS3(
            file.buffer,
            fileName,
            "universities/sections",
            file.mimetype
          );
          console.log(`🔍 File details for ${key}:`, {
            originalname: file.originalname,
            s3Url: s3Url
          });
          fileMap.set(file.originalname, s3Url);
        }
       
        const replaceSectionImages = (obj: any) => {
          Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === "string" && fileMap.has(val)) {
              console.log(`✅ Replacing ${key}: "${val}" → "${fileMap.get(val)}"`);
              obj[key] = fileMap.get(val);
            } else if (typeof val === "string" && (val.includes('.webp') || val.includes('.jpg') || val.includes('.png'))) {
              console.log(`⚠️ Found image filename but NOT in fileMap: ${key} = "${val}"`);
            }
            
            if (Array.isArray(val)) {
              val.forEach((item) => replaceSectionImages(item));
            } else if (val && typeof val === "object") {
              replaceSectionImages(val);
            }
          });
        };
    
        sections.forEach((section: any) => {
          if (section.props) replaceSectionImages(section.props);
        });
    
        console.log("🔍 Sections AFTER replacement:", JSON.stringify(sections, null, 2));
      }
    }
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

    // 💾 Save to DB
    const updated = await UniversityService.updateUniversity(
      Number(id),
      updateData,
      validBanners,
      validSections
    );

    if (!updated) return errorResponse(res, "University not found", 404);

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
    const result = await UniversityService.getAllUniversities(page,limit);
    return successResponse(res, result, "Universities fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch universities", 400);
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
    const deleted = await UniversityService.deleteUniversity(Number(req.params.id));
    if (!deleted) return errorResponse(res, "University not found", 404);
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

export const fetchList = async (req: Request, res: Response) => {
  try {
    console.log("fetchList");
    const universities = await UniversityService.fetchUniversitiesList();
    return successResponse(res, universities, "Universities list fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch universities list", 400);
  }
};