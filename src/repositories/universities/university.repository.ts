// university.repository.ts
import pool from "../../config/db";

export const UniversityRepo = {
  async createUniversity(universityData: any) {
    const [result]: any = await pool.query(
      `INSERT INTO universities 
       (university_name, university_slug, university_logo, university_location, university_brochure, author_name, is_active, approval_id, placement_partner_ids, emi_partner_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        universityData.university_name,
        universityData.university_slug,
        universityData.university_logo || null,
        universityData.university_location || null,
        universityData.university_brochure || null,
        universityData.author_name || null, 
        universityData.is_active ?? true,
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
      `SELECT id, university_slug, university_name, university_logo
       FROM universities 
       WHERE is_active = 1
       ORDER BY id DESC`
    );
    return { data: universities };
  },
};
