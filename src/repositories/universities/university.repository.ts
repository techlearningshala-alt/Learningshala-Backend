// university.repository.ts
import pool from "../../config/db";

export const UniversityRepo = {
  async createUniversity(universityData: any) {
    const [result]: any = await pool.query(
      `INSERT INTO universities 
       (university_name, university_slug, meta_title, meta_description, university_logo, university_location, university_brochure, author_name, university_type_id, is_active, is_page_created, menu_visibility, \`compare\`, approval_id, placement_partner_ids, emi_partner_ids,
        university_tag_line, establishment_year, emi_provides, university_features, education_mode, admission_mode, examination_mode, scholarship_provides, alumni_status, online_classes, placement_assistance, why_choose, compare_information)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        universityData.compare !== undefined ? (universityData.compare ? 1 : 0) : 0,
        universityData.approval_id ?? null,
        universityData.placement_partner_ids ?? null,
        universityData.emi_partner_ids ?? null,
        // Compare Information fields
        universityData.university_tag_line || null,
        universityData.establishment_year || null,
        // Booleans stored as TINYINT(1)
        universityData.emi_provides ? 1 : 0,
        universityData.university_features
          ? (typeof universityData.university_features === "string"
              ? universityData.university_features
              : JSON.stringify(universityData.university_features))
          : null,
        universityData.education_mode || null,
        universityData.admission_mode || null,
        universityData.examination_mode || null,
        universityData.scholarship_provides || null,
        universityData.alumni_status || null,
        universityData.online_classes ? 1 : 0,
        universityData.placement_assistance ? 1 : 0,
        universityData.why_choose
          ? (typeof universityData.why_choose === "string"
              ? universityData.why_choose
              : JSON.stringify(universityData.why_choose))
          : null,
        universityData.compare_information
          ? (typeof universityData.compare_information === "string"
              ? universityData.compare_information
              : JSON.stringify(universityData.compare_information))
          : null,
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
        u.updated_at,
        u.created_at,
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
