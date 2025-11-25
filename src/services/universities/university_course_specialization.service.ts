import slugify from "slugify";
import pool from "../../config/db";
import specializationRepo from "../../repositories/universities/university_course_specialization.repository";
import courseRepo from "../../repositories/universities/university_course.repository";
import feeTypeRepo from "../../repositories/universities/fee_type.repository";
import {
  CreateUniversityCourseSpecializationDto,
  UpdateUniversityCourseSpecializationDto,
} from "../../models/universities/university_course_specialization.model";
import { syncSpecializationBanners, getSpecializationBanners } from "./university_course_specialization_banner.service";
import UniversityCourseSpecializationSectionService, { generateSectionKey } from "./university_course_specialization_section.service";

interface ListSpecializationOptions {
  universityId?: number;
  universityCourseId?: number;
  search?: string;
}

const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const normalized = String(value).toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  throw new Error("Invalid boolean value provided");
};

const normaliseSpecializationPayload = (payload: any): CreateUniversityCourseSpecializationDto => {
  if (!payload.university_id) {
    throw new Error("university_id is required");
  }
  if (!payload.university_course_id) {
    throw new Error("university_course_id is required");
  }

  const name = String(payload.name || "").trim();
  if (!name) {
    throw new Error("Name is required");
  }

  const slug =
    (payload.slug ? String(payload.slug).trim() : "") ||
    slugify(name, { lower: true, strict: true });

  return {
    university_id: Number(payload.university_id),
    university_course_id: Number(payload.university_course_id),
    name,
    slug,
    h1Tag: payload.h1Tag ? String(payload.h1Tag).trim() : null,
    duration: payload.duration ?? null,
    label: payload.label ?? null,
    course_thumbnail: payload.course_thumbnail ?? null,
    author_name: payload.author_name ?? null,
    is_active: toBoolean(payload.is_active) ?? true,
    syllabus_file: payload.syllabus_file ?? null,
    brochure_file: payload.brochure_file ?? null,
    fee_type_values: parseFeeTypeValues(payload.fee_type_values),
  };
};

export async function listUniversityCourseSpecializations(
  page = 1,
  limit = 10,
  options: ListSpecializationOptions = {}
) {
  const result = await specializationRepo.findAll(page, limit, options);
  const lookup = await buildFeeTypeLookup();
  result.data = result.data.map((specialization: any) => enrichSpecializationFeeTypeValues(specialization, lookup));
  return result;
}

async function getSpecializationSections(specializationId: number) {
  const sections = await UniversityCourseSpecializationSectionService.getSectionsBySpecializationId(specializationId);
  
  // Old format: keep original structure
  const oldFormat = sections.map((s: any) => ({
    id: s.id,
    section_key: s.section_key,
    title: s.title,
    component: s.component,
    props: typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {},
  }));
  
  // New transformed format: merge all sections into a single object
  const newFormat = sections.reduce((acc: Record<string, any>, s: any) => {
    const props = typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {};
    const title = s.title || "";
    
    // Determine the value for the title key
    // Priority: content > first prop value > empty string
    let titleValue: any = "";
    let contentUsedForTitle = false;
    
    if (props.content !== undefined && props.content !== null && props.content !== "") {
      titleValue = props.content;
      contentUsedForTitle = true;
    } else if (Object.keys(props).length > 0) {
      // Use first prop value if no content
      const firstKey = Object.keys(props)[0];
      titleValue = props[firstKey];
    }
    
    // Set title as a key with its value
    if (title) {
      acc[title] = titleValue;
    }
    
    // Flatten ALL props into the same object (excluding content if it was used for title)
    // This preserves all props like videoID, videoTitle, gridContent, faculties, etc.
    Object.keys(props).forEach((key) => {
      // Skip content if it was already used as the title value to avoid duplication
      if (key === "content" && contentUsedForTitle) {
        return; // Skip adding content since it's already the title value
      }
      acc[key] = props[key];
    });
    
    return acc;
  }, {});
  
  // Return both formats separately
  return {
    sections: oldFormat,
    sections_transformed: newFormat,
  };
}

export async function getUniversityCourseSpecializationById(id: number) {
  const specialization = await specializationRepo.findById(id);
  if (!specialization) return null;
  const banners = await getSpecializationBanners(id);
  const sectionsData = await getSpecializationSections(id);
  (specialization as any).banners = banners || [];
  (specialization as any).sections = sectionsData.sections || [];
  (specialization as any).sections_transformed = sectionsData.sections_transformed || {};
  const lookup = await buildFeeTypeLookup();
  return enrichSpecializationFeeTypeValues(specialization, lookup);
}

export async function getUniversityCourseSpecializationBySlug(slug: string) {
  const [rows]: any = await pool.query(
    `SELECT * FROM university_course_specialization WHERE slug = ? LIMIT 1`,
    [slug]
  );
  if (!rows.length) return null;
  const specialization = await specializationRepo.findById(rows[0].id);
  if (!specialization) return null;
  const banners = await getSpecializationBanners(rows[0].id);
  const sectionsData = await getSpecializationSections(rows[0].id);
  (specialization as any).banners = banners || [];
  (specialization as any).sections = sectionsData.sections || [];
  (specialization as any).sections_transformed = sectionsData.sections_transformed || {};
  const lookup = await buildFeeTypeLookup();
  return enrichSpecializationFeeTypeValues(specialization, lookup);
}

export async function getUniversityCourseSpecializationByCourseSlugAndSpecializationSlug(
  universitySlug: string,
  courseSlug: string,
  specializationSlug: string
) {
  // First, get the university by slug to find its ID
  const { getUniversityBySlug } = await import("./university.service");
  const university = await getUniversityBySlug(universitySlug);
  
  if (!university || !university.data?.id) {
    return null;
  }

  // Then get the course using university_id and course slug
  const { getUniversityCourseByUniversitySlugAndCourseSlug } = await import("./university_course.service");
  const course = await getUniversityCourseByUniversitySlugAndCourseSlug(universitySlug, courseSlug);
  
  if (!course || !course.id) {
    return null;
  }

  // Then find the specialization using course_id and specialization slug
  const specialization = await specializationRepo.findByCourseIdAndSlug(course.id, specializationSlug);
  if (!specialization) return null;
  
  const banners = await getSpecializationBanners(specialization.id);
  const sectionsData = await getSpecializationSections(specialization.id);
  (specialization as any).banners = banners || [];
  (specialization as any).sections = sectionsData.sections || [];
  (specialization as any).sections_transformed = sectionsData.sections_transformed || {};
  const lookup = await buildFeeTypeLookup();
  return enrichSpecializationFeeTypeValues(specialization, lookup);
}

export async function getUniversityCourseSpecializationOptions(
  universityCourseId: number
) {
  return specializationRepo.findOptionsByCourse(universityCourseId);
}

export async function createUniversityCourseSpecialization(payload: any) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const normalized = normaliseSpecializationPayload(payload);
    const specialization = await specializationRepo.create(normalized);
    if (!specialization) {
      throw new Error("Failed to create university course specialization");
    }

    const banners = extractBannersArray(payload);
    if (banners && banners.length > 0) {
      await syncSpecializationBanners(specialization.id, banners);
    }

    const sections = extractSectionsArray(payload);
    
    if (sections && sections.length > 0) {
      // Filter out sections with invalid/missing titles or components
      const validSections = sections.filter(
        (section: any) => section && section.title && section.title.trim() && section.component && section.component.trim()
      );

      // Insert sections using transaction connection
      for (const section of validSections) {
        try {
          const sectionKey = section.section_key || generateSectionKey(section.title);
          await conn.query(
            `INSERT INTO university_course_specialization_sections (specialization_id, section_key, title, component, props) VALUES (?, ?, ?, ?, ?)`,
            [specialization.id, sectionKey, section.title.trim(), section.component.trim(), JSON.stringify(section.props || {})]
          );
        } catch (error: any) {
          console.error("❌ [CREATE] Error saving section:", section.title, error.message);
          throw error; // Re-throw to rollback transaction
        }
      }
    }

    await conn.commit();

    const refreshed = await specializationRepo.findById(specialization.id);
    if (refreshed) {
      const banners = await getSpecializationBanners(specialization.id);
      const sectionsData = await getSpecializationSections(specialization.id);
      (refreshed as any).banners = banners || [];
      (refreshed as any).sections = sectionsData.sections || [];
      (refreshed as any).sections_transformed = sectionsData.sections_transformed || {};
    }
    const lookup = await buildFeeTypeLookup();
    return refreshed ? enrichSpecializationFeeTypeValues(refreshed, lookup) : refreshed;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateUniversityCourseSpecialization(
  id: number,
  payload: any
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const normalized: UpdateUniversityCourseSpecializationDto = {};

    if (payload.university_id !== undefined) {
      normalized.university_id = Number(payload.university_id);
    }

    if (payload.university_course_id !== undefined) {
      normalized.university_course_id = Number(payload.university_course_id);
    }

    if (payload.name !== undefined) {
      const name = String(payload.name).trim();
      if (!name) {
        throw new Error("Name cannot be empty");
      }
      normalized.name = name;
      if (!payload.slug) {
        normalized.slug = slugify(name, { lower: true, strict: true });
      }
    }

    if (payload.slug !== undefined) {
      const slug = String(payload.slug).trim();
      normalized.slug =
        slug || slugify(String(normalized.name ?? ""), { lower: true, strict: true });
    }

    if (payload.h1Tag !== undefined) {
      normalized.h1Tag = payload.h1Tag ? String(payload.h1Tag).trim() : null;
    }

    if (payload.duration !== undefined) {
      normalized.duration = payload.duration ?? null;
    }
    if (payload.label !== undefined) {
      normalized.label = payload.label ?? null;
    }
    if (payload.course_thumbnail !== undefined) {
      normalized.course_thumbnail = payload.course_thumbnail ?? null;
    }
    if (payload.author_name !== undefined) {
      normalized.author_name = payload.author_name ?? null;
    }
    if (payload.is_active !== undefined) {
      const boolValue = toBoolean(payload.is_active);
      if (boolValue !== undefined) {
        normalized.is_active = boolValue;
      }
    }
    if (payload.syllabus_file !== undefined) {
      normalized.syllabus_file = payload.syllabus_file ?? null;
    }
    if (payload.brochure_file !== undefined) {
      normalized.brochure_file = payload.brochure_file ?? null;
    }
    if (payload.fee_type_values !== undefined) {
      const parsed = parseFeeTypeValues(payload.fee_type_values);
      normalized.fee_type_values = parsed && Object.keys(parsed).length ? parsed : null;
    }
    if (payload.saveWithDate !== undefined) {
      normalized.saveWithDate =
        payload.saveWithDate === true || payload.saveWithDate === "true";
    }

    const updated = await specializationRepo.update(id, normalized);
    const lookup = await buildFeeTypeLookup();

    const banners = extractBannersArray(payload);
    if (banners !== undefined) {
      await syncSpecializationBanners(id, banners);
    }

    const sections = extractSectionsArray(payload);
    
    // Always process sections if they're provided (even if empty array)
    if (payload.sections !== undefined) {
      // Get existing sections for merging
      const existingSections = await UniversityCourseSpecializationSectionService.getSectionsBySpecializationId(id);
      
      // Helper function to deep merge and preserve valid image paths
      function deepMergeImages(oldObj: any, newObj: any): any {
        if (!newObj || typeof newObj !== 'object') return newObj;
        if (!oldObj || typeof oldObj !== 'object') return newObj;

        // Start with newObj (prioritize new values)
        const result: any = { ...newObj };

        // Iterate over oldObj to preserve image paths and merge nested structures
        Object.keys(oldObj).forEach(key => {
          const oldVal = oldObj[key];
          const newVal = newObj[key];

          // If key doesn't exist in newObj, preserve old value (for backward compatibility)
          if (!(key in newObj)) {
            result[key] = oldVal;
            return;
          }

          // If newVal is empty string or null, preserve it (means value was removed/cleared)
          if (newVal === "" || newVal === null) {
            result[key] = newVal;
            return;
          }
          
          // If newVal already has a valid /uploads/ path, use it (new upload)
          if (typeof newVal === 'string' && newVal.startsWith('/uploads/')) {
            result[key] = newVal;
            return;
          }

          // Handle arrays
          if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            result[key] = newVal.map((item: any, idx: number) => {
              if (typeof item === 'object' && item !== null && typeof oldVal[idx] === 'object' && oldVal[idx] !== null) {
                return deepMergeImages(oldVal[idx], item);
              }
              return item;
            });
          } 
          // Handle nested objects
          else if (typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) && 
                   typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)) {
            result[key] = deepMergeImages(oldVal, newVal);
          } 
          // For image fields: if newVal is not an image path but oldVal is, preserve oldVal
          // (This handles cases where user didn't upload a new image but wants to keep the old one)
          else if (typeof newVal === 'string' && newVal && !newVal.startsWith('/uploads/') && 
                   typeof oldVal === 'string' && oldVal.startsWith('/uploads/')) {
            result[key] = oldVal;
          }
          // For non-image fields: if newVal exists, use it (already done by spread operator)
          // This ensures all non-image props are preserved
        });

        return result;
      }

      // Use extracted sections or default to empty array
      const sectionsToProcess = Array.isArray(sections) ? sections : [];

      // Merge sections - preserve old images for unchanged sections
      const mergedSections = sectionsToProcess.map((newSection: any, index: number) => {
        const oldSection = existingSections[index];
        
        if (!oldSection) {
          return newSection;
        }

        const oldProps = typeof oldSection.props === 'string' 
          ? JSON.parse(oldSection.props || '{}') 
          : oldSection.props || {};
        
        const newProps = newSection.props || {};
        const mergedProps = deepMergeImages(oldProps, newProps);

        return {
          ...newSection,
          section_key: newSection.section_key || generateSectionKey(newSection.title),
          props: mergedProps
        };
      });

      // Delete old sections using transaction connection
      await conn.query(`DELETE FROM university_course_specialization_sections WHERE specialization_id = ?`, [id]);

      // Filter out sections with invalid/missing titles or components
      const validMergedSections = mergedSections.filter(
        (section: any) => section && section.title && section.title.trim() && section.component && section.component.trim()
      );

      // Insert merged sections using transaction connection
      for (const section of validMergedSections) {
        try {
          const sectionKey = section.section_key || generateSectionKey(section.title);
          await conn.query(
            `INSERT INTO university_course_specialization_sections (specialization_id, section_key, title, component, props) VALUES (?, ?, ?, ?, ?)`,
            [id, sectionKey, section.title.trim(), section.component.trim(), JSON.stringify(section.props || {})]
          );
        } catch (error: any) {
          console.error("❌ [UPDATE] Error saving section:", section.title, error.message);
          throw error; // Re-throw to rollback transaction
        }
      }
    }

    await conn.commit();

    const refreshed = await specializationRepo.findById(id);
    if (refreshed) {
      const banners = await getSpecializationBanners(id);
      const sectionsData = await getSpecializationSections(id);
      (refreshed as any).banners = banners || [];
      (refreshed as any).sections = sectionsData.sections || [];
      (refreshed as any).sections_transformed = sectionsData.sections_transformed || {};
    }
    return refreshed ? enrichSpecializationFeeTypeValues(refreshed, lookup) : refreshed;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteUniversityCourseSpecialization(id: number) {
  return specializationRepo.delete(id);
}

export async function toggleUniversityCourseSpecializationStatus(id: number, isActive: boolean) {
  const specialization = await specializationRepo.findById(id);
  if (!specialization) return null;

  await specializationRepo.update(id, { is_active: isActive });
  return await specializationRepo.findById(id);
}

function parseFeeTypeValues(input: any): Record<string, number> | null {
  if (input === undefined || input === null || input === "") return null;

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return sanitizeFeeMap(parsed);
    } catch (error) {
      throw new Error("Invalid fee type values payload");
    }
  }

  if (typeof input === "object") {
    return sanitizeFeeMap(input);
  }

  throw new Error("Unsupported fee type values payload");
}

function sanitizeFeeMap(raw: Record<string, any>): Record<string, number> {
  const result: Record<string, number> = {};
  Object.entries(raw || {}).forEach(([key, value]) => {
    if (!key) return;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      throw new Error(`Fee value for "${key}" must be numeric`);
    }
    result[key] = numeric;
  });
  return result;
}

interface FeeTypeMeta {
  fee_key: string;
  title: string;
}

interface FeeTypeLookup {
  byKey: Record<string, FeeTypeMeta>;
  byTitle: Record<string, FeeTypeMeta>;
}

async function buildFeeTypeLookup(): Promise<FeeTypeLookup> {
  const feeTypes = await feeTypeRepo.findAllRaw();
  const lookup: FeeTypeLookup = {
    byKey: {},
    byTitle: {},
  };

  feeTypes.forEach((fee) => {
    const feeKeySanitized = sanitizeIdentifier(fee.fee_key || fee.title);
    const titleSanitized = sanitizeIdentifier(fee.title);
    const meta: FeeTypeMeta = {
      fee_key: fee.fee_key || feeKeySanitized,
      title: fee.title || fee.fee_key || feeKeySanitized,
    };
    if (feeKeySanitized) {
      lookup.byKey[feeKeySanitized] = meta;
    }
    if (titleSanitized) {
      lookup.byTitle[titleSanitized] = meta;
    }
  });

  return lookup;
}

function enrichSpecializationFeeTypeValues(specialization: any, lookup: FeeTypeLookup) {
  if (!specialization) return specialization;

  const rawValues = specialization.fee_type_values as Record<string, any> | null | undefined;
  if (!rawValues) {
    specialization.fee_type_values = null;
    return specialization;
  }

  const entries = Object.entries(rawValues);
  if (!entries.length) {
    specialization.fee_type_values = null;
    return specialization;
  }

  const enriched: Record<string, number> = {};

  entries.forEach(([labelKey, raw]) => {
    if (raw === undefined || raw === null) return;

    let value = raw as any;
    let feeKeyCandidate: string | undefined;

    if (typeof raw === "object") {
      if (raw.value === undefined) return;
      value = raw.value;
      feeKeyCandidate = raw.fee_key || raw.key;
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    const meta = resolveFeeTypeMeta(feeKeyCandidate, labelKey, lookup);
    const feeKey = meta.fee_key;

    enriched[feeKey] = numeric;
  });

  specialization.fee_type_values = Object.keys(enriched).length ? enriched : null;
  return specialization;
}

function resolveFeeTypeMeta(
  feeKeyCandidate: string | undefined,
  labelKey: string,
  lookup: FeeTypeLookup
): FeeTypeMeta {
  const candidates = [feeKeyCandidate, labelKey]
    .map((key) => sanitizeIdentifier(key))
    .filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (lookup.byKey[candidate]) {
      return lookup.byKey[candidate];
    }
    if (lookup.byTitle[candidate]) {
      return lookup.byTitle[candidate];
    }
  }

  const fallbackKey = candidates[0] || sanitizeIdentifier(labelKey) || labelKey;
  return {
    fee_key: fallbackKey,
    title: labelKey,
  };
}

function sanitizeIdentifier(value: string | undefined | null) {
  if (!value) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractBannersArray(payload: any) {
  if (!payload.banners || !Array.isArray(payload.banners)) {
    return undefined;
  }

  return payload.banners
    .filter((b: any) => b && b.banner_key)
    .map((b: any) => ({
      banner_key: b.banner_key,
      banner_image: normalizeNullable(b.banner_image),
      video_id: normalizeNullable(b.video_id),
      video_title: normalizeNullable(b.video_title),
    }));
}

function extractSectionsArray(payload: any) {
  if (!payload.sections || !Array.isArray(payload.sections)) {
    return undefined;
  }

  return payload.sections.map((s: any) => ({
    section_key: s.section_key || generateSectionKey(s.title),
    title: s.title,
    component: s.component,
    props: s.props || {},
  }));
}

function normalizeNullable(value: any) {
  // If explicitly null, return null (to allow clearing fields)
  if (value === null) return null;
  
  // If undefined, return undefined (to skip updating the field)
  if (value === undefined) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null; // Convert empty strings to null to clear fields
    if (trimmed === "null") return null;
    if (trimmed === "__REMOVE__") return null;
    return trimmed;
  }

  return value;
}
