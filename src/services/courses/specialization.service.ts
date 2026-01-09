import type { PoolConnection } from "mysql2/promise";
import pool from "../../config/db";
import SpecializationRepo from "../../repositories/courses/specialization.repository";
import { Specialization } from "../../models/courses/specializations.model";
import specializationBannerRepo, {
  SpecializationBannerInput,
} from "../../repositories/courses/specialization_banner.repository";
import specializationSectionRepo, {
  SpecializationSectionInput,
} from "../../repositories/courses/specialization_section.repository";

const repo = new SpecializationRepo();
const bannerRepo = specializationBannerRepo;
const sectionRepo = specializationSectionRepo;

function generateSectionKey(title: string): string {
  return String(title || "")
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, ""); // Remove special characters except underscores
}

function transformSpecializationSections(sections: any[]): Record<string, any> {
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

const attachRelations = async (specialization: any) => {
  if (!specialization) return null;
  const [banners, sections] = await Promise.all([
    bannerRepo.findBySpecializationId(specialization.id),
    sectionRepo.findBySpecializationId(specialization.id),
  ]);
  specialization.banners = banners || [];
  // For admin (ID-based) flows we want the raw sections array
  specialization.sections = sections || [];
  return specialization;
};

export const listSpecializations = (page = 1, limit = 10, filters?: { search?: string; course_id?: number }) => 
  repo.findAll(page, limit, filters);
export const getSpecialization = async (id: number) => {
  const specialization = await repo.findById(id);
  return await attachRelations(specialization);
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

export const addSpecialization = async (
  item: Partial<Specialization>,
  banners: SpecializationBannerInput[] = [],
  sections: SpecializationSectionInput[] = []
) => {
  if ("specialization_intro" in (item as any)) {
    const intro = (item as any).specialization_intro;
    if (intro !== undefined) {
      item.description = intro ?? "";
    }
    delete (item as any).specialization_intro;
  }

  const specialization = await runInTransaction(async (conn) => {
    const created = await repo.create(item, conn);
    if (!created) {
      throw new Error("Unable to create specialization");
    }

    if (banners && banners.length) {
      await bannerRepo.replaceForSpecialization(created.id, banners, conn);
    }
    if (sections && sections.length) {
      await sectionRepo.replaceForSpecialization(created.id, sections, conn);
    }

    return created;
  });

  return getSpecialization(specialization.id);
};

export const updateSpecialization = async (
  id: number,
  item: Partial<Specialization>,
  saveWithDate = true,
  banners?: SpecializationBannerInput[] | null,
  sections?: SpecializationSectionInput[] | null
) => {
  if ("specialization_intro" in (item as any)) {
    const intro = (item as any).specialization_intro;
    if (intro !== undefined) {
      item.description = intro ?? "";
    }
    delete (item as any).specialization_intro;
  }

  const updated = await runInTransaction(async (conn) => {
    const record = await repo.update(id, item, saveWithDate, conn);
    if (!record) {
      return null;
    }

    if (banners !== undefined) {
      await bannerRepo.replaceForSpecialization(id, banners || [], conn);
    }
    if (sections !== undefined) {
      await sectionRepo.replaceForSpecialization(id, sections || [], conn);
    }

    return record;
  });

  if (!updated) {
    return null;
  }

  return getSpecialization(id);
};

export const deleteSpecialization = (id: number) => repo.delete(id);

export const toggleSpecializationStatus = async (id: number, isActive: boolean) => {
  const updated = await repo.update(id, { is_active: isActive }, false);
  return updated ? await attachRelations(updated) : null;
};

export const toggleSpecializationMenuVisibility = async (id: number, isVisible: boolean) => {
  const updated = await repo.update(id, { menu_visibility: isVisible }, false);
  return updated ? await attachRelations(updated) : null;
};

async function getSpecializationFaqs(specializationId: number) {
  try {
    const [rows]: any = await pool.query(
      `SELECT f.id,
              f.title,
              f.description,
              f.category_id,
              c.heading AS category_heading
       FROM specialization_faqs f
       LEFT JOIN course_faq_categories c ON f.category_id = c.id
       WHERE f.specialization_id = ?
       ORDER BY 
         CASE WHEN c.heading IS NULL THEN 1 ELSE 0 END,
         c.heading,
         f.created_at DESC`,
      [specializationId]
    );

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

    return Object.values(grouped);
  } catch (error) {
    console.error(`❌ [SPECIALIZATION FAQ] Error fetching specialization FAQs for specialization_id ${specializationId}:`, error);
    return [];
  }
}

export const getSpecializationByCourseSlugAndSpecializationSlug = async (
  courseSlug: string,
  specializationSlug: string
) => {
  const specialization = await repo.findByCourseSlugAndSpecializationSlug(
    courseSlug,
    specializationSlug
  );
  if (!specialization) return null;

  const [banners, sections, faqs] = await Promise.all([
    bannerRepo.findBySpecializationId(specialization.id),
    sectionRepo.findBySpecializationId(specialization.id),
    getSpecializationFaqs(specialization.id),
  ]);

  (specialization as any).banners = banners || [];
  // For slug-based API we return transformed sections object (like course API)
  (specialization as any).sections = transformSpecializationSections(sections || []);
  // Include FAQ data grouped by category
  (specialization as any).faq_data = faqs || [];

  // Attach placement partners (like course by slug API)
  try {
    const placementIds: number[] = Array.isArray((specialization as any).placement_partner_ids)
      ? (specialization as any).placement_partner_ids
      : [];

    let placementPartners: any[] = [];

    if (placementIds.length > 0) {
      const [rows]: any = await pool.query(
        `SELECT id, name, logo FROM placement_partners WHERE id IN (?)`,
        [placementIds]
      );
      placementPartners = rows || [];
    }

    (specialization as any).placement_partners = placementPartners;
  } catch (error) {
    console.error("❌ [SPECIALIZATION] Error fetching placement partners for specialization slug:", specializationSlug, error);
    (specialization as any).placement_partners = [];
  }

  return specialization;
};