import { Request, Response } from "express";
import slugify from "slugify";
import * as SpecializationService from "../../services/courses/specialization.service";
import {
  createSpecializationSchema,
  updateSpecializationSchema,
} from "../../validators/courses/domain.validator";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";
import { 
  indexSpecialization, 
  deleteSpecializationFromIndex, 
  searchSpecializations,
  getSpecializationSuggestions,
  getSpecializationSpellSuggestions
} from "../../services/elasticsearch/specialization.search.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const course_id = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;
    
    const filters: { search?: string; course_id?: number } = {};
    if (search) filters.search = search;
    if (course_id) filters.course_id = course_id;
    
    const result = await SpecializationService.listSpecializations(page, limit, Object.keys(filters).length > 0 ? filters : undefined);
    return successResponse(res, result, "Specializations fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specializations");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const specialization = await SpecializationService.getSpecialization(Number(req.params.id));
    if (!specialization) return errorResponse(res, "Specialization not found", 404);
    return successResponse(res, specialization, "Specialization fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specialization");
  }
};

export const getByCourseSlugAndSpecializationSlug = async (req: Request, res: Response) => {
  try {
    const courseSlug = typeof req.params.course_slug === "string" 
      ? req.params.course_slug.trim() 
      : null;
    const specializationSlug = typeof req.params.slug === "string" 
      ? req.params.slug.trim() 
      : null;

    if (!courseSlug || courseSlug.length === 0) {
      return errorResponse(res, "Course slug is required", 400);
    }

    if (!specializationSlug || specializationSlug.length === 0) {
      return errorResponse(res, "Specialization slug is required", 400);
    }

    const specialization = await SpecializationService.getSpecializationByCourseSlugAndSpecializationSlug(
      courseSlug,
      specializationSlug
    );

    if (!specialization) {
      return errorResponse(res, "Specialization not found", 404);
    }

    return successResponse(res, specialization, "Specialization fetched successfully");
  } catch (err: any) {
    console.error("❌ Error fetching specialization by slugs:", err);
    return errorResponse(res, err.message || "Failed to fetch specialization", 400);
  }
};

const normalizeFilesArray = (files: Request["files"]) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
};

const toBoolean = (value: any, defaultValue = true) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "on"].includes(normalized);
};

const parseJsonArray = (payload: any) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const shouldDeleteFromS3 = (path?: string | null) =>
  Boolean(path) && !String(path).startsWith("/uploads/");

const sanitizeSectionKey = (value: string) => {
  if (!value) return `section_${Date.now()}`;
  return slugify(value, { lower: true, strict: true }).replace(/-/g, "_");
};

const uploadAsset = async (file: Express.Multer.File, folder: string) => {
  const fileName = generateFileName(file.originalname);
  return uploadToS3(file.buffer, fileName, folder, file.mimetype);
};

const parseIds = (value: any) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (Array.isArray(parsed)) {
      return parsed
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n));
    }
    return [];
  } catch {
    return [];
  }
};

const normalizeSpecializationPayload = (body: any) => {
  const courseId = Number(body.course_id);
  const priority =
    body.priority !== undefined && body.priority !== ""
      ? Number(body.priority)
      : undefined;
  const durationValue =
    body.course_duration !== undefined && body.course_duration !== ""
      ? body.course_duration
      : body.duration;

  return {
    course_id: Number.isNaN(courseId) ? undefined : courseId,
    name: body.name,
    duration_for_schema: body.duration_for_schema ?? null,
    eligibility: body.eligibility ?? null,
    eligibility_info: body.eligibility_info ?? null,
    emi_facility: body.emi_facility !== undefined ? toBoolean(body.emi_facility, false) : undefined,
    slug: body.slug,
    h1Tag: body.h1Tag,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    label: body.label,
    description: body.description ?? null,
    course_duration: durationValue ?? null,
    upload_brochure: body.upload_brochure ?? null,
    author_name: body.author_name ?? null,
    learning_mode: body.learning_mode ?? null,
    podcast_embed: body.podcast_embed ?? null,
    priority: priority ?? 0,
    thumbnail: body.thumbnail ?? null,
    placement_partner_ids: parseIds(body.placement_partner_ids),
    is_active: toBoolean(body.is_active, true),
    menu_visibility: toBoolean(body.menu_visibility, true),
  };
};

const prepareBannerPayload = async (
  rawBanners: any,
  files: Express.Multer.File[],
  existingMap: Map<number, any> = new Map()
) => {
  if (rawBanners === undefined) return undefined;

  const banners = parseJsonArray(rawBanners);
  const prepared = [];

  for (let index = 0; index < banners.length; index++) {
    const banner = banners[index] || {};
    const bannerId =
      banner.id !== undefined && banner.id !== null
        ? Number(banner.id)
        : null;
    const existing = bannerId ? existingMap.get(bannerId) : undefined;
    const fileField = `banner_${index}_banner_image`;
    const file = files.find((f) => f.fieldname === fileField);
    let bannerImage = banner.banner_image ?? existing?.banner_image ?? null;

    if (file) {
      if (shouldDeleteFromS3(existing?.banner_image)) {
        await deleteFromS3(existing.banner_image);
      }
      bannerImage = await uploadAsset(file, "specializations/banners");
    } else if (banner.banner_image === "__REMOVE__") {
      if (shouldDeleteFromS3(existing?.banner_image)) {
        await deleteFromS3(existing.banner_image);
      }
      bannerImage = null;
    }

    prepared.push({
      banner_image: bannerImage,
      video_id: banner.video_id || null,
      video_title: banner.video_title || null,
    });
  }

  return prepared;
};

const prepareSectionPayload = async (
  rawSections: any,
  files: Express.Multer.File[],
  body: any,
  existingMap: Map<string, any> = new Map()
) => {
  if (rawSections === undefined) return undefined;

  const sections = parseJsonArray(rawSections);
  const prepared = [];

  for (const section of sections) {
    // Use the provided section_key directly, or generate from title if not provided
    const sectionKey = section.section_key || sanitizeSectionKey(section.title);
    // Use sanitized key for lookup purposes (to match existing sections)
    const lookupKey = sanitizeSectionKey(section.section_key || section.title);
    const existing = existingMap.get(lookupKey);
    const imageField = `${lookupKey}_image`;
    const originalImageField = `${section.section_key}_image`;
    
    // Try to find file by sanitized key first, then by original section_key
    const file = files.find((f) => f.fieldname === imageField) ||
                 files.find((f) => f.fieldname === originalImageField);
    const inlineValue = body?.[imageField] || body?.[originalImageField];
    let imagePath = existing?.image || null;

    // Priority: new file upload > remove flag > existing string value > keep existing
    if (file) {
      // New file uploaded - upload it
      if (shouldDeleteFromS3(existing?.image)) {
        await deleteFromS3(existing.image);
      }
      imagePath = await uploadAsset(file, "specializations/sections");
    } else if (inlineValue === "__REMOVE__") {
      // Explicit removal requested
      if (shouldDeleteFromS3(existing?.image)) {
        await deleteFromS3(existing.image);
      }
      imagePath = null;
    } else if (typeof inlineValue === "string" && inlineValue && inlineValue !== "__REMOVE__") {
      // Existing image path sent as string (preserve it)
      imagePath = inlineValue;
    } else if (existing?.image) {
      // Keep existing image from database
      imagePath = existing.image;
    } else {
      imagePath = null;
    }

    prepared.push({
      section_key: sectionKey, // Use the provided section_key directly (not sanitized)
      title: section.title || sectionKey,
      description: section.description || "",
      image: imagePath,
    });
  }

  return prepared;
};

export const create = async (req: Request, res: Response) => {
  try {
    const files = normalizeFilesArray(req.files);
    const body = { ...req.body };

    const thumbnailFile = files.find((file) => file.fieldname === "thumbnail");
    if (thumbnailFile) {
      body.thumbnail = await uploadAsset(thumbnailFile, "specializations/thumbnails");
    }

    const ebookFile = files.find((file) => file.fieldname === "ebook_file");
    if (ebookFile) {
      body.upload_brochure = await uploadAsset(ebookFile, "specializations/ebooks");
    } else if (body.ebook_file && typeof body.ebook_file === "string") {
      body.upload_brochure = body.ebook_file;
    }

    const normalizedPayload = normalizeSpecializationPayload(body);
    const validatedData: any = createSpecializationSchema.parse(normalizedPayload);
    validatedData.slug =
      validatedData.slug?.trim() ||
      slugify(validatedData.name, { lower: true, strict: true });
    validatedData.description =
      body.specialization_intro ?? validatedData.description ?? "";
    delete validatedData.specialization_intro;

    const banners = await prepareBannerPayload(body.banners, files);
    const sections = await prepareSectionPayload(body.sections, files, body);

    const specialization = await SpecializationService.addSpecialization(
      validatedData,
      banners ?? [],
      sections ?? []
    );
    
    // 🔍 Index specialization in Elasticsearch (async, don't wait)
    try {
      await indexSpecialization(specialization);
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }
    
    return successResponse(res, specialization, "Specialization created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create specialization", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existingSpecialization = await SpecializationService.getSpecialization(id);
    if (!existingSpecialization) {
      return errorResponse(res, "Specialization not found", 404);
    }

    const files = normalizeFilesArray(req.files);
    const {
      saveWithDate = "true",
      existingThumbnail,
      ...rest
    } = req.body as Record<string, any>;
    const saveDateFlag = saveWithDate !== "false";
    const body = { ...rest };

    let thumbnailPath =
      existingThumbnail ||
      existingSpecialization.thumbnail ||
      body.thumbnail ||
      null;
    const thumbnailFile = files.find((file) => file.fieldname === "thumbnail");
    if (thumbnailFile) {
      if (shouldDeleteFromS3(thumbnailPath)) {
        await deleteFromS3(thumbnailPath);
      }
      thumbnailPath = await uploadAsset(thumbnailFile, "specializations/thumbnails");
    } else if (body.thumbnail === "__REMOVE__") {
      if (shouldDeleteFromS3(thumbnailPath)) {
        await deleteFromS3(thumbnailPath);
      }
      thumbnailPath = null;
    }
    body.thumbnail = thumbnailPath;

    let brochurePath =
      body.upload_brochure ||
      body.ebook_file ||
      existingSpecialization.upload_brochure ||
      null;
    const ebookFile = files.find((file) => file.fieldname === "ebook_file");
    if (ebookFile) {
      if (shouldDeleteFromS3(existingSpecialization.upload_brochure)) {
        await deleteFromS3(existingSpecialization.upload_brochure);
      }
      brochurePath = await uploadAsset(ebookFile, "specializations/ebooks");
    } else if (body.ebook_file === "__REMOVE__") {
      if (shouldDeleteFromS3(existingSpecialization.upload_brochure)) {
        await deleteFromS3(existingSpecialization.upload_brochure);
      }
      brochurePath = null;
    }
    body.upload_brochure = brochurePath;

    const normalizedPayload = normalizeSpecializationPayload(body);
    const validatedData: any = updateSpecializationSchema.parse(normalizedPayload);
    if (validatedData.name) {
      validatedData.slug =
        validatedData.slug?.trim() ||
        slugify(validatedData.name, { lower: true, strict: true });
    }
    if (body.specialization_intro !== undefined) {
      validatedData.description = body.specialization_intro ?? "";
    }
    delete validatedData.specialization_intro;

    const bannersMap = new Map<number, any>(
      (existingSpecialization.banners || [])
        .filter((banner: any) => banner && banner.id !== undefined)
        .map((banner: any) => [Number(banner.id), banner])
    );
    const sectionsMap = new Map<string, any>(
      (existingSpecialization.sections || []).map((section: any) => [
        sanitizeSectionKey(section.section_key || section.title),
        section,
      ])
    );

    const banners = await prepareBannerPayload(
      body.banners,
      files,
      bannersMap
    );
    const sections = await prepareSectionPayload(
      body.sections,
      files,
      body,
      sectionsMap
    );

    const specialization = await SpecializationService.updateSpecialization(
      id,
      validatedData,
      saveDateFlag,
      banners,
      sections
    );

    if (!specialization) return errorResponse(res, "Specialization not found or nothing to update", 404);
    
    // 🔍 Index specialization in Elasticsearch (async, don't wait)
    try {
      await indexSpecialization(specialization);
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }
    
    return successResponse(res, specialization, "Specialization updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update specialization", 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const specializationId = Number(req.params.id);
    const result = await SpecializationService.deleteSpecialization(specializationId);
    
    // 🔍 Remove from Elasticsearch index (async, don't wait)
    try {
      await deleteSpecializationFromIndex(specializationId);
    } catch (esError) {
      console.error('⚠️ Elasticsearch delete error (non-blocking):', esError);
    }
    
    return successResponse(res, result, "Specialization deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete specialization", 400);
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const updated = await SpecializationService.toggleSpecializationStatus(Number(id), Boolean(is_active));
    if (!updated) return errorResponse(res, "Specialization not found", 404);

    return successResponse(res, updated, "Specialization status updated successfully");
  } catch (error: any) {
    console.error("❌ Error toggling specialization status:", error);
    return errorResponse(
      res,
      error.message || "Failed to toggle specialization status",
      400
    );
  }
};

export const toggleMenuVisibility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { menu_visibility } = req.body;

    const updated = await SpecializationService.toggleSpecializationMenuVisibility(Number(id), Boolean(menu_visibility));
    if (!updated) return errorResponse(res, "Specialization not found", 404);

    return successResponse(res, updated, "Specialization menu visibility updated successfully");
  } catch (error: any) {
    console.error("❌ Error toggling specialization menu visibility:", error);
    return errorResponse(
      res,
      error.message || "Failed to toggle specialization menu visibility",
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
    const course_id = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;

    const result = await searchSpecializations(query, {
      page,
      limit,
      filters: {
        is_active,
        course_id
      }
    });

    return successResponse(res, result, "Specializations searched successfully");
  } catch (err: any) {
    console.error('❌ Search error:', err);
    return errorResponse(res, err.message || "Failed to search specializations", 400);
  }
};

export const suggestions = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      return successResponse(res, [], "Suggestions fetched successfully");
    }

    const suggestions = await getSpecializationSuggestions(query, limit);
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

    const suggestion = await getSpecializationSpellSuggestions(query);
    return successResponse(res, suggestion, "Spell check completed");
  } catch (err: any) {
    console.error('❌ Spell check error:', err);
    return errorResponse(res, err.message || "Failed to check spelling", 400);
  }
};
