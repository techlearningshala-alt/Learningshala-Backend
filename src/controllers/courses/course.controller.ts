import { Request, Response } from "express";
import slugify from "slugify";
import * as CourseService from "../../services/courses/course.service";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../../validators/courses/domain.validator";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";
import { 
  indexCourse, 
  deleteCourseFromIndex, 
  searchCourses,
  getCourseSuggestions,
  getCourseSpellSuggestions
} from "../../services/elasticsearch/course.search.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await CourseService.listCourses(page, limit);
    return successResponse(res, result, "Courses fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch courses");
  }
};

export const getCourseName = async (req: Request, res: Response) => {
  try {
    const result = await CourseService.listCoursesName();
    return successResponse(res, result, "Courses name fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch courses name");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const param = req.params.id;
    if (!param) return errorResponse(res, "Course ID or slug is required", 400);
    
    // Check if parameter is numeric (ID) or string (slug)
    const numericId = Number(param);
    if (!isNaN(numericId) && Number.isInteger(numericId) && numericId > 0) {
      // It's a numeric ID
      const course = await CourseService.getCourse(numericId);
      if (!course) return errorResponse(res, "Course not found", 404);
      return successResponse(res, course, "Course fetched successfully");
    } else {
      // It's a slug, use slug-based lookup
      const course = await CourseService.getCourseBySlug(param);
      if (!course) return errorResponse(res, "Course not found", 404);
      return successResponse(res, course, "Course fetched successfully");
    }
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch course");
  }
};

export const getBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) return errorResponse(res, "Course slug is required", 400);
    const course = await CourseService.getCourseBySlug(slug);
    if (!course) return errorResponse(res, "Course not found", 404);
    return successResponse(res, course, "Course fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch course");
  }
};

export const getCoursesByDomain = async (req: Request, res: Response) => {
  try {
    const result = await CourseService.getCoursesByDomain();
    return successResponse(res, result, "Courses grouped by domain fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch courses by domain");
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

const normalizeCoursePayload = (body: any) => {
  const domainId = Number(body.domain_id);
  const priority =
    body.priority !== undefined && body.priority !== ""
      ? Number(body.priority)
      : undefined;
  const durationValue =
    body.course_duration !== undefined && body.course_duration !== ""
      ? body.course_duration
      : body.duration;

  return {
    domain_id: Number.isNaN(domainId) ? undefined : domainId,
    name: body.name,
    slug: body.slug,
    h1Tag: body.h1Tag,
    label: body.label,
    description: body.description ?? null,
    course_duration: durationValue ?? null,
    upload_brochure: body.upload_brochure ?? null,
    author_name: body.author_name ?? null,
    learning_mode: body.learning_mode ?? null,
    podcast_embed: body.podcast_embed ?? null,
    placement_partner_ids: parseIds(body.placement_partner_ids),
    emi_partner_ids: parseIds(body.emi_partner_ids),
    priority: priority ?? 0,
    thumbnail: body.thumbnail ?? null,
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
      bannerImage = await uploadAsset(file, "courses/banners");
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
    
    // Debug: log available files for this section
    if (section.section_key === "admission_process") {
      console.log(`[SECTION IMAGE DEBUG] Section: ${section.section_key}, LookupKey: ${lookupKey}`);
      console.log(`[SECTION IMAGE DEBUG] Looking for fieldname: ${imageField} or ${originalImageField}`);
      console.log(`[SECTION IMAGE DEBUG] Available files:`, files.map(f => f.fieldname));
      console.log(`[SECTION IMAGE DEBUG] Body keys:`, Object.keys(body || {}).filter(k => k.includes('image')));
    }
    
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
      imagePath = await uploadAsset(file, "courses/sections");
      console.log(`[SECTION IMAGE] Uploaded new image for section ${sectionKey}: ${imagePath}`);
    } else if (inlineValue === "__REMOVE__") {
      // Explicit removal requested
      if (shouldDeleteFromS3(existing?.image)) {
        await deleteFromS3(existing.image);
      }
      imagePath = null;
      console.log(`[SECTION IMAGE] Removed image for section ${sectionKey}`);
    } else if (typeof inlineValue === "string" && inlineValue && inlineValue !== "__REMOVE__") {
      // Existing image path sent as string (preserve it)
      imagePath = inlineValue;
      console.log(`[SECTION IMAGE] Preserved existing image for section ${sectionKey}: ${imagePath}`);
    } else if (existing?.image) {
      // Keep existing image from database
      imagePath = existing.image;
      console.log(`[SECTION IMAGE] Keeping existing image for section ${sectionKey}: ${imagePath}`);
    } else {
      imagePath = null;
      console.log(`[SECTION IMAGE] No image for section ${sectionKey}`);
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
      body.thumbnail = await uploadAsset(thumbnailFile, "courses/thumbnails");
    }

    const ebookFile = files.find((file) => file.fieldname === "ebook_file");
    if (ebookFile) {
      body.upload_brochure = await uploadAsset(ebookFile, "courses/ebooks");
    } else if (body.ebook_file && typeof body.ebook_file === "string") {
      body.upload_brochure = body.ebook_file;
    }

    const normalizedPayload = normalizeCoursePayload(body);
    const validatedData: any = createCourseSchema.parse(normalizedPayload);
    validatedData.slug =
      validatedData.slug?.trim() ||
      slugify(validatedData.name, { lower: true, strict: true });
    validatedData.description =
      body.course_intro ?? validatedData.description ?? "";
    delete validatedData.course_intro;

    const banners = await prepareBannerPayload(body.banners, files);
    const sections = await prepareSectionPayload(body.sections, files, body);

    const course = await CourseService.addCourse(
      validatedData,
      banners ?? [],
      sections ?? []
    );
    
    // 🔍 Index course in Elasticsearch (async, don't wait)
    try {
      await indexCourse(course);
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }
    
    return successResponse(res, course, "Course created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create course", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existingCourse = await CourseService.getCourse(id);
    if (!existingCourse) {
      return errorResponse(res, "Course not found", 404);
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
      existingCourse.thumbnail ||
      body.thumbnail ||
      null;
    const thumbnailFile = files.find((file) => file.fieldname === "thumbnail");
    if (thumbnailFile) {
      if (shouldDeleteFromS3(thumbnailPath)) {
        await deleteFromS3(thumbnailPath);
      }
      thumbnailPath = await uploadAsset(thumbnailFile, "courses/thumbnails");
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
      existingCourse.upload_brochure ||
      null;
    const ebookFile = files.find((file) => file.fieldname === "ebook_file");
    if (ebookFile) {
      if (shouldDeleteFromS3(existingCourse.upload_brochure)) {
        await deleteFromS3(existingCourse.upload_brochure);
      }
      brochurePath = await uploadAsset(ebookFile, "courses/ebooks");
    } else if (body.ebook_file === "__REMOVE__") {
      if (shouldDeleteFromS3(existingCourse.upload_brochure)) {
        await deleteFromS3(existingCourse.upload_brochure);
      }
      brochurePath = null;
    }
    body.upload_brochure = brochurePath;

    const normalizedPayload = normalizeCoursePayload(body);
    const validatedData: any = updateCourseSchema.parse(normalizedPayload);
    if (validatedData.name) {
      validatedData.slug =
        validatedData.slug?.trim() ||
        slugify(validatedData.name, { lower: true, strict: true });
    }
    if (body.course_intro !== undefined) {
      validatedData.description = body.course_intro ?? "";
    }
    delete validatedData.course_intro;

    const bannersMap = new Map<number, any>(
      (existingCourse.banners || [])
        .filter((banner: any) => banner && banner.id !== undefined)
        .map((banner: any) => [Number(banner.id), banner])
    );
    const sectionsMap = new Map<string, any>(
      (existingCourse.sections || []).map((section: any) => [
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

    const course = await CourseService.updateCourse(
      id,
      validatedData,
      saveDateFlag,
      banners,
      sections
    );
    if (!course) {
      return errorResponse(res, "Course not found or nothing to update", 404);
    }

    // 🔍 Index course in Elasticsearch (async, don't wait)
    try {
      await indexCourse(course);
    } catch (esError) {
      console.error('⚠️ Elasticsearch indexing error (non-blocking):', esError);
    }

    return successResponse(res, course, "Course updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update course", 400);
  }
};


export const remove = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const result = await CourseService.deleteCourse(courseId);
    
    // 🔍 Remove from Elasticsearch index (async, don't wait)
    try {
      await deleteCourseFromIndex(courseId);
    } catch (esError) {
      console.error('⚠️ Elasticsearch delete error (non-blocking):', esError);
    }
    
    return successResponse(res, result, "Course deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete course", 400);
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;
    const updated = await CourseService.toggleCourseStatus(id, Boolean(is_active));
    if (!updated) {
      return errorResponse(res, "Course not found", 404);
    }
    return successResponse(res, updated, "Course status updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update course status", 400);
  }
};

export const toggleMenuVisibility = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { menu_visibility } = req.body;
    const updated = await CourseService.toggleCourseMenuVisibility(
      id,
      Boolean(menu_visibility)
    );
    if (!updated) {
      return errorResponse(res, "Course not found", 404);
    }
    return successResponse(
      res,
      updated,
      "Course menu visibility updated successfully"
    );
  } catch (err: any) {
    return errorResponse(
      res,
      err.message || "Failed to update course menu visibility",
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
    const domain_id = req.query.domain_id ? parseInt(req.query.domain_id as string) : undefined;

    const result = await searchCourses(query, {
      page,
      limit,
      filters: {
        is_active,
        domain_id
      }
    });

    return successResponse(res, result, "Courses searched successfully");
  } catch (err: any) {
    console.error('❌ Search error:', err);
    return errorResponse(res, err.message || "Failed to search courses", 400);
  }
};

export const suggestions = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      return successResponse(res, [], "Suggestions fetched successfully");
    }

    const suggestions = await getCourseSuggestions(query, limit);
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

    const suggestion = await getCourseSpellSuggestions(query);
    return successResponse(res, suggestion, "Spell check completed");
  } catch (err: any) {
    console.error('❌ Spell check error:', err);
    return errorResponse(res, err.message || "Failed to check spelling", 400);
  }
};
