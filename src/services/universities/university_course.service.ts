import slugify from "slugify";
import pool from "../../config/db";
import courseRepo from "../../repositories/universities/university_course.repository";
import feeTypeRepo from "../../repositories/universities/fee_type.repository";
import { UniversityRepo } from "../../repositories/universities/university.repository";
import {
  CreateUniversityCourseDto,
  UpdateUniversityCourseDto,
} from "../../models/universities/university_course.model";
import { syncCourseBanners, getCourseBanners } from "./university_course_banner.service";
import UniversityCourseSectionService, { generateSectionKey } from "./university_course_section.service";

interface ListCourseOptions {
  universityId?: number;
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

const normaliseCoursePayload = (payload: any): CreateUniversityCourseDto => {
  if (!payload.university_id) {
    throw new Error("university_id is required");
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
    name,
    slug,
    h1Tag: payload.h1Tag ? String(payload.h1Tag).trim() : null,
    meta_title: payload.meta_title ? String(payload.meta_title).trim() : null,
    meta_description: payload.meta_description ? String(payload.meta_description).trim() : null,
    duration: payload.duration ?? null,
    emi_duration: payload.emi_duration !== undefined && payload.emi_duration !== null && payload.emi_duration !== "" 
      ? Number(payload.emi_duration) 
      : null,
    label: payload.label ?? null,
    course_thumbnail: payload.course_thumbnail ?? null,
    author_name: payload.author_name ?? null,
    is_active: toBoolean(payload.is_active) ?? true,
    syllabus_file: payload.syllabus_file ?? null,
    brochure_file: payload.brochure_file ?? null,
    fee_type_values: parseFeeTypeValues(payload.fee_type_values),
  };
};

export async function listUniversityCourses(
  page = 1,
  limit = 10,
  options: ListCourseOptions = {}
) {
  const result = await courseRepo.findAll(page, limit, options);
  const lookup = await buildFeeTypeLookup();
  result.data = result.data.map((course: any) => enrichCourseFeeTypeValues(course, lookup));
  return result;
}

/**
 * Recursively normalize null values to empty strings in objects and arrays
 */
function normalizeNullsToEmptyStrings(obj: any): any {
  if (obj === null || obj === undefined) {
    return "";
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeNullsToEmptyStrings(item));
  }
  
  if (typeof obj === "object") {
    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      normalized[key] = normalizeNullsToEmptyStrings(value);
    }
    return normalized;
  }
  
  return obj;
}

async function getCourseSections(courseId: number) {
  const sections = await UniversityCourseSectionService.getSectionsByCourseId(courseId);
  
  // Old format: keep original structure
  const oldFormat = sections.map((s: any) => {
    const rawProps = typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {};
    const normalizedProps = normalizeNullsToEmptyStrings(rawProps);
    return {
      id: s.id,
      section_key: s.section_key,
      title: s.title,
      component: s.component,
      props: normalizedProps,
    };
  });
  
  // New transformed format: merge all sections into a single object
  const newFormat = sections.reduce((acc: Record<string, any>, s: any) => {
    const rawProps = typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {};
    const props = normalizeNullsToEmptyStrings(rawProps);
    const sectionKey = s.section_key || generateSectionKey(s.title || "");
    
    // Determine the value for the section_key
    // Priority: content > first prop value > empty string
    let titleValue: any = "";
    let titleValueKey: string | null = null;
    let contentUsedForTitle = false;
    
    if (props.content !== undefined && props.content !== null && props.content !== "") {
      titleValue = props.content;
      titleValueKey = "content";
      contentUsedForTitle = true;
    } else if (Object.keys(props).length > 0) {
      // Use first prop value if no content
      const firstKey = Object.keys(props)[0];
      titleValue = props[firstKey];
      titleValueKey = firstKey;
    }
    
    // Set section_key as a key with its value
    if (sectionKey) {
      acc[sectionKey] = titleValue;
    }
    
    // Flatten ALL props into the same object (excluding content/prop if it was used for section_key)
    // This preserves all props like videoID, videoTitle, gridContent, faculties, etc.
    Object.keys(props).forEach((key) => {
      // Skip content/prop if it was already used as the section_key value to avoid duplication
      if ((key === "content" && contentUsedForTitle) || key === titleValueKey) {
        return; // Skip adding content/prop since it's already the section_key value
      }
      acc[key] = props[key];
    });
    
    return acc;
  }, {});
  
  // Check if University_Faculties exists in sections_transformed and first object has empty name and img
  if (newFormat.University_Faculties) {
    const faculties = newFormat.University_Faculties;
    if (Array.isArray(faculties) && faculties.length > 0) {
      const firstFaculty = faculties[0];
      if (
        firstFaculty &&
        (firstFaculty.name === "" || firstFaculty.name === null || firstFaculty.name === undefined) &&
        (firstFaculty.img === "" || firstFaculty.img === null || firstFaculty.img === undefined)
      ) {
        newFormat.University_Faculties = [];
      }
    }
  }
  
  // Return both formats separately
  return {
    sections: oldFormat,
    sections_transformed: newFormat,
  };
}

async function getCourseFaqs(courseId: number) {
  try {
    const [rows]: any = await pool.query(
      `SELECT f.id,
              f.title,
              f.description,
              f.category_id,
              f.created_at,
              c.heading AS category_heading,
              c.priority AS category_priority
       FROM university_course_faqs f
       LEFT JOIN university_faq_categories c ON f.category_id = c.id
       WHERE f.course_id = ?
       ORDER BY c.priority ASC, c.id ASC, f.created_at DESC`,
      [courseId]
    );

console.log("rows", rows);
    if (!rows || !rows.length) {
      return [];
    }

    const grouped = rows.reduce((acc: Record<string, any>, faq: any) => {
      const categoryId = faq.category_id || 0;
      const heading = faq.category_heading || "Uncategorized";
      const slug = heading.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");

      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: heading,
          cat_id: slug || `category-${categoryId || "uncategorized"}`,
          priority: faq.category_priority || 999,
          items: [],
        };
      }

      acc[categoryId].items.push({
        id: faq.id,
        question: faq.title,
        answer: faq.description,
        category_id: faq.category_id,
      });

      return acc;
    }, {});

    // Convert to array format and sort by priority
    const result = Object.values(grouped).sort((a: any, b: any) => {
      const priorityA = a.priority ?? 999;
      const priorityB = b.priority ?? 999;
      return priorityA - priorityB;
    });
    
    console.log(`✅ [COURSE FAQ] Grouped FAQs for course_id ${courseId}:`, result.length, "categories");
    return result;
  } catch (error) {
    console.error(`❌ [COURSE FAQ] Error fetching course FAQs for course_id ${courseId}:`, error);
    return [];
  }
}

export async function getUniversityCourseById(id: number) {
  const course = await courseRepo.findById(id);
  if (!course) return null;
  const banners = await getCourseBanners(id);
  const sectionsData = await getCourseSections(id);
  (course as any).banners = banners || [];
  (course as any).sections = sectionsData.sections || [];
  (course as any).sections_transformed = sectionsData.sections_transformed || {};
  (course as any).course_faqs = await getCourseFaqs(id);
  const lookup = await buildFeeTypeLookup();
  return enrichCourseFeeTypeValues(course, lookup);
}

export async function getUniversityCourseBySlug(slug: string) {
  const course = await courseRepo.findBySlug(slug);
  if (!course) return null;
  const banners = await getCourseBanners(course.id);
  const sectionsData = await getCourseSections(course.id);
  (course as any).banners = banners || [];
  (course as any).sections = sectionsData.sections || [];
  (course as any).sections_transformed = sectionsData.sections_transformed || {};
  (course as any).course_faqs = await getCourseFaqs(course.id);
  const lookup = await buildFeeTypeLookup();
  return enrichCourseFeeTypeValues(course, lookup);
}

export async function   getUniversityCourseByUniversitySlugAndCourseSlug(
  universitySlug: string,
  courseSlug: string
) {
  // First, get the university by slug to find its ID
  const university = await UniversityRepo.getUniversityBySlug(universitySlug);
  
  if (!university || !university.id) {
    return null;
  }

  // Then find the course using university_id and course slug
  const course = await courseRepo.findByUniversityIdAndSlug(university.id, courseSlug);
  if (!course) return null;
  const banners = await getCourseBanners(course.id);
  const sectionsData = await getCourseSections(course.id);
  (course as any).banners = banners || [];
  (course as any).sections = sectionsData.sections || [];
  (course as any).sections_transformed = sectionsData.sections_transformed || {};
  (course as any).university_faqs = await getCourseFaqs(course.id);
  
  // Fetch specializations for this course
  let specializationData: Array<{ 
    name: string; 
    slug: string; 
    label: string | null;
    emi_duration: number | null;
    duration: string | null; 
    image: string | null; 
    fees: any
  }> = [];
  try {
    const { getUniversityCourseSpecializationOptions } = await import("./university_course_specialization.service");
    const specializations = await getUniversityCourseSpecializationOptions(course.id);
    
    // Format specializations - send complete fee_type_values as fees without extraction
    specializationData = specializations.map((spec: any) => {
      return {
        name: spec.name,
        slug: spec.slug,
        label: spec.label,
        emi_duration: spec.emi_duration,
        duration: spec.duration,
        image: spec.course_thumbnail,
        fees: spec.fee_type_values || {},
      };
    });
  } catch (e) {
    console.error('Error fetching course specializations:', e);
  }
  
  (course as any).specialization_data = specializationData;
  
  const lookup = await buildFeeTypeLookup();
  return enrichCourseFeeTypeValues(course, lookup);
}

export async function createUniversityCourse(payload: any) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const normalized = normaliseCoursePayload(payload);
    const course = await courseRepo.create(normalized);
    if (!course) {
      throw new Error("Failed to create university course");
    }

    const banners = extractBannersArray(payload);
    if (banners && banners.length > 0) {
      await syncCourseBanners(course.id, banners);
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
          // Use section_key from section if provided (from defaultSections), otherwise generate from title
          // This ensures default section keys are preserved
          const sectionKey = (section.section_key && section.section_key.trim()) 
            ? section.section_key 
            : generateSectionKey(section.title || "");
          await conn.query(
            `INSERT INTO university_course_sections (course_id, section_key, title, component, props) VALUES (?, ?, ?, ?, ?)`,
            [course.id, sectionKey, section.title.trim(), section.component.trim(), JSON.stringify(section.props || {})]
          );
        } catch (error: any) {
          console.error("❌ [CREATE] Error saving section:", section.title, error.message);
          throw error; // Re-throw to rollback transaction
        }
      }
    }

    await conn.commit();

    const refreshed = await courseRepo.findById(course.id);
    if (refreshed) {
      const banners = await getCourseBanners(course.id);
      const sectionsData = await getCourseSections(course.id);
      (refreshed as any).banners = banners || [];
      (refreshed as any).sections = sectionsData.sections || [];
      (refreshed as any).sections_transformed = sectionsData.sections_transformed || {};
      (refreshed as any).course_faqs = await getCourseFaqs(course.id);
    }
    const lookup = await buildFeeTypeLookup();
    return refreshed ? enrichCourseFeeTypeValues(refreshed, lookup) : refreshed;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateUniversityCourse(id: number, payload: any) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const normalized: UpdateUniversityCourseDto = {};

    if (payload.university_id !== undefined) {
      normalized.university_id = Number(payload.university_id);
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
    if (payload.meta_title !== undefined) {
      normalized.meta_title = payload.meta_title ? String(payload.meta_title).trim() : null;
    }
    if (payload.meta_description !== undefined) {
      normalized.meta_description = payload.meta_description ? String(payload.meta_description).trim() : null;
    }

        if (payload.duration !== undefined) {
          normalized.duration = payload.duration ?? null;
        }
        if (payload.emi_duration !== undefined) {
          normalized.emi_duration = payload.emi_duration !== null && payload.emi_duration !== "" 
            ? Number(payload.emi_duration) 
            : null;
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

    const updated = await courseRepo.update(id, normalized);
    const lookup = await buildFeeTypeLookup();

    const banners = extractBannersArray(payload);
    if (banners !== undefined) {
      await syncCourseBanners(id, banners);
    }

    const sections = extractSectionsArray(payload);
    
    // Always process sections if they're provided (even if empty array)
    if (payload.sections !== undefined) {
      // Get existing sections for merging
      const existingSections = await UniversityCourseSectionService.getSectionsByCourseId(id);
      
      // Helper function to deep merge and preserve valid image paths
      function deepMergeImages(oldObj: any, newObj: any): any {
        if (!newObj || typeof newObj !== 'object') return newObj;
        if (!oldObj || typeof oldObj !== 'object') return newObj;

        const result: any = { ...newObj };

        Object.keys(oldObj).forEach(key => {
          const oldVal = oldObj[key];
          const newVal = newObj[key];

          // If newVal is empty string or null, it means image was removed
          if (newVal === "" || newVal === null) {
            result[key] = null;
            return;
          }
          
          // If newVal already has a valid /uploads/ path, use it
          if (typeof newVal === 'string' && newVal.startsWith('/uploads/')) {
            result[key] = newVal;
            return;
          }

          if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            result[key] = newVal.map((item: any, idx: number) => {
              if (typeof item === 'object' && typeof oldVal[idx] === 'object') {
                return deepMergeImages(oldVal[idx], item);
              }
              return item;
            });
          } else if (typeof oldVal === 'object' && typeof newVal === 'object' && !Array.isArray(oldVal)) {
            result[key] = deepMergeImages(oldVal, newVal);
          } else if (typeof newVal === 'string' && newVal && !newVal.startsWith('/uploads/')) {
            if (typeof oldVal === 'string' && oldVal.startsWith('/uploads/')) {
              result[key] = oldVal;
            }
          }
        });

        return result;
      }

      // Use extracted sections or default to empty array
      const sectionsToProcess = Array.isArray(sections) ? sections : [];

      // Merge sections - preserve old images and section_key from database
      // Match by section_key first, then by component if section_key doesn't match
      const mergedSections = sectionsToProcess.map((newSection: any) => {
        // Try to find matching old section by section_key or component
        const oldSection = existingSections.find((old: any) => 
          (newSection.section_key && old.section_key === newSection.section_key) ||
          old.component === newSection.component
        );
        
        if (!oldSection) {
          // New section, ensure it has section_key
          return {
            ...newSection,
            section_key: newSection.section_key || generateSectionKey(newSection.title || "")
          };
        }

        const oldProps = typeof oldSection.props === 'string' 
          ? JSON.parse(oldSection.props || '{}') 
          : oldSection.props || {};
        
        const newProps = newSection.props || {};
        const mergedProps = deepMergeImages(oldProps, newProps);

        // Priority: Use database section_key if it exists (preserve existing)
        // Otherwise use newSection.section_key (from default sections)
        // Finally generate from title if neither exists
        // This ensures existing section_keys are preserved, but new ones from default sections are used
        const finalSectionKey = (oldSection.section_key && oldSection.section_key.trim()) 
          ? oldSection.section_key 
          : (newSection.section_key && newSection.section_key.trim())
            ? newSection.section_key
            : generateSectionKey(newSection.title || "");

        return {
          ...newSection,
          section_key: finalSectionKey,
          props: mergedProps
        };
      });

      // Delete old sections using transaction connection
      await conn.query(`DELETE FROM university_course_sections WHERE course_id = ?`, [id]);

      // Filter out sections with invalid/missing titles or components
      const validMergedSections = mergedSections.filter(
        (section: any) => section && section.title && section.title.trim() && section.component && section.component.trim()
      );

      // Insert merged sections using transaction connection
      for (const section of validMergedSections) {
        try {
          // Use the section_key from merged section (already set with priority: old > new > generated)
          // Ensure we use the trimmed section_key if it exists
          const sectionKey = (section.section_key && section.section_key.trim()) 
            ? section.section_key 
            : generateSectionKey(section.title || "");
          await conn.query(
            `INSERT INTO university_course_sections (course_id, section_key, title, component, props) VALUES (?, ?, ?, ?, ?)`,
            [id, sectionKey, section.title.trim(), section.component.trim(), JSON.stringify(section.props || {})]
          );
        } catch (error: any) {
          console.error("❌ [UPDATE] Error saving section:", section.title, error.message);
          throw error; // Re-throw to rollback transaction
        }
      }
    }

    await conn.commit();

    const refreshed = await courseRepo.findById(id);
    if (refreshed) {
      const banners = await getCourseBanners(id);
      const sectionsData = await getCourseSections(id);
      (refreshed as any).banners = banners || [];
      (refreshed as any).sections = sectionsData.sections || [];
      (refreshed as any).sections_transformed = sectionsData.sections_transformed || {};
      (refreshed as any).course_faqs = await getCourseFaqs(id);
    }
    return refreshed ? enrichCourseFeeTypeValues(refreshed, lookup) : refreshed;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteUniversityCourse(id: number) {
  return courseRepo.delete(id);
}

export async function toggleUniversityCourseStatus(id: number, isActive: boolean) {
  const course = await courseRepo.findById(id);
  if (!course) return null;

  await courseRepo.update(id, { is_active: isActive });
  return await courseRepo.findById(id);
}

export async function toggleUniversityCoursePageCreated(id: number, isPageCreated: boolean) {
  const course = await courseRepo.findById(id);
  if (!course) return null;

  await courseRepo.update(id, { is_page_created: isPageCreated });
  return await courseRepo.findById(id);
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

function enrichCourseFeeTypeValues(course: any, lookup: FeeTypeLookup) {
  if (!course) return course;

  const rawValues = course.fee_type_values as Record<string, any> | null | undefined;
  if (!rawValues) {
    course.fee_type_values = null;
    return course;
  }

  const entries = Object.entries(rawValues);
  if (!entries.length) {
    course.fee_type_values = null;
    return course;
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

  course.fee_type_values = Object.keys(enriched).length ? enriched : null;
  return course;
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
    // Preserve section_key from payload if provided, otherwise generate from title
    section_key: s.section_key || generateSectionKey(s.title || ""),
    title: s.title,
    component: s.component,
    props: s.props || {},
  }));
}

function extractBannerPayload(payload: any) {
  const bannerImageValue = normalizeNullable(payload.course_banner);
  const brochureValue = normalizeNullable(payload.brochure_file);
  const videoIdValue = normalizeNullable(payload.video_id);
  const videoTitleValue = normalizeNullable(payload.video_title);

  const result: Record<string, any> = {};

  if (bannerImageValue !== undefined) {
    result.banner_image = bannerImageValue;
  }

  if (brochureValue !== undefined) {
    result.brochure_file = brochureValue;
  }

  if (videoIdValue !== undefined) {
    result.video_id = videoIdValue;
  }

  if (videoTitleValue !== undefined) {
    result.video_title = videoTitleValue;
  }

  return Object.keys(result).length ? result : null;
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

