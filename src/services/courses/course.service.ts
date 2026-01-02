import type { PoolConnection } from "mysql2/promise";
import pool from "../../config/db";
import CourseRepo, { Course } from "../../repositories/courses/course.repository";
import courseBannerRepo, {
  CourseBannerInput,
} from "../../repositories/courses/course_banner.repository";
import courseSectionRepo, {
  CourseSectionInput,
} from "../../repositories/courses/course_section.repository";
import SpecializationRepo from "../../repositories/courses/specialization.repository";

const repo = new CourseRepo();
const bannerRepo = courseBannerRepo;
const sectionRepo = courseSectionRepo;
const specializationRepo = new SpecializationRepo();

/**
 * Helper function to convert title to section_key format
 * Example: "Popular Courses" -> "Popular_Courses"
 */
function generateSectionKey(title: string): string {
  return String(title || "")
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, ""); // Remove special characters except underscores
}

const attachRelations = async (course: any) => {
  if (!course) return null;
  const [banners, sections] = await Promise.all([
    bannerRepo.findByCourseId(course.id),
    sectionRepo.findByCourseId(course.id),
  ]);
  course.banners = banners || [];
  // For admin (ID-based) flows we want the raw sections array
  course.sections = sections || [];
  return course;
};

export const listCourses = (page = 1, limit = 20) => repo.findAll(page, limit);
export const listCoursesName = () => repo.findAllCourseName();

export const getCourse = async (id: number) => {
  const course = await repo.findById(id);
  return await attachRelations(course);
};

/**
 * Transform course sections into object format (similar to sections_transformed in university course API)
 * Returns an object where section_key is the key and description is the value,
 * with other properties (like image) flattened into the same object
 */
function transformCourseSections(sections: any[]): Record<string, any> {
  return sections.reduce((acc: Record<string, any>, s: any) => {
    const sectionKey = s.section_key || generateSectionKey(s.title || "");

    // Use description as the value for section_key (similar to content in university sections)
    const descriptionValue = s.description ?? "";

    // Set section_key as a key with description as its value
    if (sectionKey) {
      acc[sectionKey] = descriptionValue;
    }

    // Flatten other properties (like image) into the same object
    if (s.image !== undefined && s.image !== null && s.image !== "") {
      acc.image = s.image;
    }

    return acc;
  }, {});
}

async function getCourseFaqs(courseId: number) {
  try {
    const [rows]: any = await pool.query(
      `SELECT f.id,
              f.title,
              f.description,
              f.category_id,
              c.heading AS category_heading,
              COALESCE(c.priority, 999) AS category_priority
       FROM course_faqs f
       LEFT JOIN course_faq_categories c ON f.category_id = c.id
       WHERE f.course_id = ?
       ORDER BY 
         CASE WHEN c.priority IS NULL THEN 1 ELSE 0 END,
         c.priority ASC,
         f.created_at DESC`,
      [courseId]
    );

    if (!rows || !rows.length) {
      return [];
    }

    const grouped = rows.reduce((acc: Record<string, any>, faq: any) => {
      const categoryId = faq.category_id || 0;
      const heading = faq.category_heading || "Uncategorized";
      const slug = heading.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
      const priority = faq.category_priority ?? 999;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: heading,
          cat_id: slug || `category-${categoryId || "uncategorized"}`,
          priority: priority,
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

    // Sort by priority (lower number = higher priority, appears first)
    return Object.values(grouped).sort((a: any, b: any) => {
      const priorityA = a.priority ?? 999;
      const priorityB = b.priority ?? 999;
      return priorityA - priorityB;
    });
  } catch (error) {
    console.error(`❌ [COURSE FAQ] Error fetching course FAQs for course_id ${courseId}:`, error);
    return [];
  }
}

export const getCourseBySlug = async (slug: string) => {
  const course = await repo.findBySlug(slug);
  if (!course) return null;

  const [banners, sections, specializationData, faqs] = await Promise.all([
    bannerRepo.findByCourseId(course.id),
    sectionRepo.findByCourseId(course.id),
    specializationRepo.findSpecializationDataByCourseId(course.id),
    getCourseFaqs(course.id),
  ]);

  (course as any).banners = banners || [];
  // For slug-based API we return transformed sections object (like sections_transformed)
  (course as any).sections = transformCourseSections(sections || []);
  // Include specialization data with name and duration
  (course as any).specialization_data = specializationData || [];
  // Include FAQ data grouped by category
  (course as any).faq_data = faqs || [];

  // Attach placement and EMI partners (like university by slug API)
  try {
    const placementIds: number[] = Array.isArray((course as any).placement_partner_ids)
      ? (course as any).placement_partner_ids
      : [];
    const emiIds: number[] = Array.isArray((course as any).emi_partner_ids)
      ? (course as any).emi_partner_ids
      : [];

    let placementPartners: any[] = [];
    let emiPartners: any[] = [];

    if (placementIds.length > 0) {
      const [rows]: any = await pool.query(
        `SELECT id, name, logo FROM placement_partners WHERE id IN (?)`,
        [placementIds]
      );
      placementPartners = rows || [];
    }

    if (emiIds.length > 0) {
      const [rows]: any = await pool.query(
        `SELECT id, name, logo FROM emi_partners WHERE id IN (?)`,
        [emiIds]
      );
      emiPartners = rows || [];
    }

    (course as any).placement_partners = placementPartners;
    (course as any).emi_partners = emiPartners;
  } catch (error) {
    console.error("❌ [COURSE] Error fetching placement/EMI partners for course slug:", slug, error);
    (course as any).placement_partners = [];
    (course as any).emi_partners = [];
  }

  return course;
};

const runInTransaction = async <T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const addCourse = async (
  item: Partial<Course>,
  banners: CourseBannerInput[] = [],
  sections: CourseSectionInput[] = []
) => {
  if ("course_intro" in (item as any)) {
    const intro = (item as any).course_intro;
    if (intro !== undefined) {
      item.description = intro ?? "";
    }
    delete (item as any).course_intro;
  }

  const course = await runInTransaction(async (conn) => {
    const created = await repo.create(item, conn);
    if (!created) {
      throw new Error("Unable to create course");
    }

    if (banners && banners.length) {
      await bannerRepo.replaceForCourse(created.id, banners, conn);
    }
    if (sections && sections.length) {
      await sectionRepo.replaceForCourse(created.id, sections, conn);
    }

    return created;
  });

  return getCourse(course.id);
};

export const updateCourse = async (
  id: number,
  item: Partial<Course>,
  saveWithDate = true,
  banners?: CourseBannerInput[] | null,
  sections?: CourseSectionInput[] | null
) => {
  if ("course_intro" in (item as any)) {
    const intro = (item as any).course_intro;
    if (intro !== undefined) {
      item.description = intro ?? "";
    }
    delete (item as any).course_intro;
  }

  const updated = await runInTransaction(async (conn) => {
    const record = await repo.update(id, item, saveWithDate, conn);
    if (!record) {
      return null;
    }

    if (banners !== undefined) {
      await bannerRepo.replaceForCourse(id, banners || [], conn);
    }
    if (sections !== undefined) {
      await sectionRepo.replaceForCourse(id, sections || [], conn);
    }

    return record;
  });

  if (!updated) {
    return null;
  }

  return getCourse(id);
};

export const deleteCourse = (id: number) => repo.delete(id);

export const toggleCourseStatus = async (id: number, isActive: boolean) => {
  const updated = await repo.update(
    id,
    {
      is_active: isActive,
    },
    false
  );
  return updated ? await attachRelations(updated) : null;
};

export const toggleCourseMenuVisibility = async (
  id: number,
  isVisible: boolean
) => {
  const updated = await repo.update(
    id,
    {
      menu_visibility: isVisible,
    },
    false
  );
  return updated ? await attachRelations(updated) : null;
};

export const getCoursesByDomain = async () => {
  const courses = await repo.findByDomainGrouped();
  
  // Group courses by domain name
  const grouped: Record<string, any[]> = {};
  
  courses.forEach((course: any) => {
    const domainName = course.domain_name || "Uncategorized";
    
    if (!grouped[domainName]) {
      grouped[domainName] = [];
    }
    
    grouped[domainName].push({
      course_name: course.name,
      course_thumbnail: course.thumbnail || null,
      course_slug: course.slug,
      course_id: course.id,
    });
  });
  
  return grouped;
};
