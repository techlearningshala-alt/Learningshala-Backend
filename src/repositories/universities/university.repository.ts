// university.repository.ts
import pool from "../../config/db";

export const UniversityRepo = {
  async createUniversity(universityData: any) {
    const [result]: any = await pool.query(
      `INSERT INTO universities 
       (university_name, university_slug, meta_title, meta_description, university_logo, university_location, university_brochure, author_name, university_type_id, is_active, is_page_created, menu_visibility, approval_id, placement_partner_ids, emi_partner_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        universityData.university_name,
        universityData.university_slug,
        universityData.meta_title || null,
        universityData.meta_description || null,
        universityData.university_logo || null,
        universityData.university_location || null,
        universityData.university_brochure || null,
        universityData.author_name || null,
        universityData.university_type_id ?? null,
        universityData.is_active ?? true,
        universityData.is_page_created !== undefined ? (universityData.is_page_created ? 1 : 0) : 1,
        universityData.menu_visibility !== undefined ? (universityData.menu_visibility ? 1 : 0) : 1,
        universityData.approval_id ?? null,
        universityData.placement_partner_ids ?? null,
        universityData.emi_partner_ids ?? null,
      ]
    );
    return result.insertId;
  },

  async getUniversityById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM universities WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async getUniversityBySlug(slug: string) {
    const [rows]: any = await pool.query(
      `SELECT * FROM universities WHERE university_slug = ?`,
      [slug]
    );
    return rows[0];
  },

  async createBanner(university_id: number, banner: any, banner_image: any) {
    console.log("🔍 [REPO] createBanner called with:", {
      university_id,
      banner_image,
      banner: JSON.stringify(banner, null, 2)
    });
    
    // Ensure banner_image is a string (not null/undefined)
    const imageValue = banner_image || banner?.banner_image || "";
    console.log("🔍 [REPO] Final banner_image value:", imageValue);
    
    await pool.query(
      `INSERT INTO university_banners (university_id, banner_image, video_id, video_title)
       VALUES (?, ?, ?, ?)`,
      [university_id, imageValue, banner.video_id || null, banner.video_title || null]
    );
  },

  async createSection(university_id: number, section: any) {
    await pool.query(
      `INSERT INTO university_sections (university_id, section_key, title, component, props)
       VALUES (?, ?, ?, ?, ?)`,
      [
        university_id, 
        section.section_key || null, 
        section.title, 
        section.component, 
        JSON.stringify(section.props || {})
      ]
    );
  },

  async fetchUniversitiesList() {
    const [universities]: any = await pool.query(
      `SELECT 
        u.id, 
        u.university_slug, 
        u.university_name, 
        u.university_logo, 
        u.is_page_created, 
        u.menu_visibility, 
        u.is_active,
        u.university_type_id,
        ut.name AS university_type,
        COALESCE(COUNT(DISTINCT uc.id), 0) AS course_count,
        COALESCE(COUNT(DISTINCT ucs.id), 0) AS specialization_count
       FROM universities u
       LEFT JOIN university_types ut ON u.university_type_id = ut.id
       LEFT JOIN university_courses uc ON u.id = uc.university_id
       LEFT JOIN university_course_specialization ucs ON uc.id = ucs.university_course_id
       WHERE u.is_active = 1
       GROUP BY u.id, u.university_slug, u.university_name, u.university_logo, u.is_page_created, u.menu_visibility, u.is_active, u.university_type_id, ut.name
       ORDER BY u.id ASC`
    );
    universities.forEach((item: any) => {
      item.is_active = Boolean(item.is_active);
      item.is_page_created = Boolean(item.is_page_created);
      item.menu_visibility =
        item.menu_visibility === null || item.menu_visibility === undefined
          ? true
          : Boolean(item.menu_visibility);
      // Convert counts to numbers
      item.course_count = Number(item.course_count) || 0;
      item.specialization_count = Number(item.specialization_count) || 0;
      // University type can be null if not set
      item.university_type = item.university_type || null;
    });
    return universities;
  },
};
