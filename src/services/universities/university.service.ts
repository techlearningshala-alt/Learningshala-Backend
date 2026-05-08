import pool from "../../config/db";
import { RowDataPacket } from "mysql2";
import { UniversityRepo } from "../../repositories/universities/university.repository";
import UniversitySectionService, { generateSectionKey } from "./university_section.service";

const parseCompareInformation = (raw: any): Record<string, any> => {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const UniversityService = {
  async addUniversity(body: any, banners: any[] = [], sections: any[] = []) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 🏫 Insert university
      const universityId = await UniversityRepo.createUniversity(body);

      // 🖼️ Insert banners
      for (const b of banners) {
        console.log("🔍 [SERVICE] Banner object before insert:", JSON.stringify(b, null, 2));
        console.log("🔍 [SERVICE] banner_image value:", b.banner_image);
        await UniversityRepo.createBanner(universityId, b, b.banner_image);
      }

      // 🧩 Insert sections
      for (const s of sections) {
        await UniversityRepo.createSection(universityId, s);
      }

      await conn.commit();

      // 🔄 Return the created university
      const university = await UniversityRepo.getUniversityById(universityId);
      if (university && university.is_page_created !== undefined) {
        university.menu_visibility = university.is_page_created === null || university.is_page_created === undefined ? true : Boolean(university.is_page_created);
        delete university.is_page_created;
      }
      return university;
    } catch (err) {
      console.log(err)
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

export const updateUniversity = async (
  id: any,
  updateData: any,
  banners: any = [],
  sections: any = []
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🧠 Fetch existing university data
    const [existingRows]: any = await conn.query(
      `SELECT * FROM universities WHERE id = ?`,
      [id]
    );
    const existing = existingRows[0];
    if (!existing) throw new Error("University not found");

    // 🖼 Handle image updates: null/empty means remove, undefined means keep existing
    console.log("💾 [SERVICE] Processing image updates");
    console.log("💾 [SERVICE] updateData.university_logo:", updateData.university_logo);
    console.log("💾 [SERVICE] existing.university_logo:", existing.university_logo);
    const universityLogo = updateData.university_logo !== undefined 
      ? (updateData.university_logo === null || updateData.university_logo === "" ? null : updateData.university_logo)
      : existing.university_logo;
    console.log("💾 [SERVICE] Final universityLogo:", universityLogo);
    const universityBrochure = updateData.university_brochure !== undefined
      ? (updateData.university_brochure === null || updateData.university_brochure === "" ? null : updateData.university_brochure)
      : existing.university_brochure;
    console.log("💾 [SERVICE] Final universityBrochure:", universityBrochure);

    // 🧩 Fetch existing banners and sections
    const [existingBanners]: any = await conn.query(
      `SELECT * FROM university_banners WHERE university_id = ? ORDER BY id ASC`,
      [id]
    );

    const [existingSections]: any = await conn.query(
      `SELECT * FROM university_sections WHERE university_id = ? ORDER BY id ASC`,
      [id]
    );

    // ✅ Determine the final number of banners (max of existing or new)
    const mergedBanners = [];
    for (let i = 0; i < banners.length; i++) {
      const newBanner = banners[i];
      const oldBanner = existingBanners[i];

      if (!newBanner) continue;

      console.log(`💾 [SERVICE] Processing banner ${i}:`, {
        newBanner,
        oldBanner,
        newBanner_banner_image: newBanner.banner_image,
        newBanner_existing_banner_image: newBanner.existing_banner_image,
      });

      // If the banner was explicitly removed, skip adding it to merged list
      if (newBanner.banner_image === "" || newBanner.banner_image === null) {
        console.log(`🗑️ [SERVICE] Banner ${i} flagged for removal. Skipping insert.`);
        continue;
      }

      let finalImage: string | null = null;

      if (typeof newBanner.banner_image === "string" && newBanner.banner_image.trim() !== "") {
        finalImage = newBanner.banner_image.trim();
      } else if (
        typeof newBanner.existing_banner_image === "string" &&
        newBanner.existing_banner_image.trim() !== ""
      ) {
        finalImage = newBanner.existing_banner_image.trim();
      } else if (
        oldBanner?.banner_image &&
        typeof oldBanner.banner_image === "string" &&
        oldBanner.banner_image.trim() !== ""
      ) {
        finalImage = oldBanner.banner_image.trim();
      }

      if (!finalImage) {
        console.log(`⚠️ [SERVICE] Banner ${i} has no valid image after merge. Skipping.`);
        continue;
      }

      mergedBanners.push({
        video_id: newBanner.video_id || null,
        video_title: newBanner.video_title || null,
        banner_image: finalImage,
      });
    }
    let sql = `
      UPDATE universities 
      SET 
        university_name = ?, 
        university_slug = ?, 
        meta_title = ?,
        meta_description = ?,
        university_logo = ?, 
        university_location = ?, 
        university_brochure = ?, 
        author_name = ?, 
        university_type_id = ?,
        is_active = ?, 
        approval_id = ?,
        placement_partner_ids = ?,
        emi_partner_ids = ?,
        \`compare\` = ?,
        university_tag_line = ?,
        establishment_year = ?,
        emi_provides = ?,
        university_features = ?,
        education_mode = ?,
        admission_mode = ?,
        examination_mode = ?,
        scholarship_provides = ?,
        alumni_status = ?,
        online_classes = ?,
        placement_assistance = ?,
        why_choose = ?,
        compare_information = ?
    `;

    const normalizeBool = (val: any): number =>
      val === true || val === "true" || val === 1 || val === "1" ? 1 : 0;

    const serializeJsonField = (val: any): string | null => {
      if (val === undefined || val === null) return null;
      if (typeof val === "string") return val;
      try {
        return JSON.stringify(val);
      } catch {
        return null;
      }
    };

    const params = [
      updateData.university_name,
      updateData.university_slug,
      updateData.meta_title || null,
      updateData.meta_description || null,
      universityLogo,
      updateData.university_location || null,
      universityBrochure,
      updateData.author_name || null,
      updateData.university_type_id ?? null,

      // ✅ Convert string/boolean to numeric flag
      updateData.is_active === "false" || updateData.is_active === false ? 0 : 1,

      updateData.approval_id || "[]",
      updateData.placement_partner_ids || "[]",
      updateData.emi_partner_ids || "[]",
      updateData.compare === undefined ? normalizeBool(existing.compare) : normalizeBool(updateData.compare),

      // Compare Information fields
      updateData.university_tag_line || null,
      updateData.establishment_year || null,
      normalizeBool(updateData.emi_provides),
      serializeJsonField(updateData.university_features),
      updateData.education_mode || null,
      updateData.admission_mode || null,
      updateData.examination_mode || null,
      updateData.scholarship_provides || null,
      updateData.alumni_status || null,
      normalizeBool(updateData.online_classes),
      normalizeBool(updateData.placement_assistance),
      serializeJsonField(updateData.why_choose),
      updateData.compare_information === undefined
        ? existing.compare_information || null
        : serializeJsonField(updateData.compare_information),
    ];

    // ✅ Only include updated_at if saveWithDate = true
    if (updateData.saveWithDate === true || updateData.saveWithDate === "true") {
      sql += `, updated_at = NOW()`;
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await conn.query(sql, params);



    // 🧩 Merge sections - preserve old images for unchanged sections
    // ✅ Priority for section_key: 1) From payload (defaultSections), 2) From DB, 3) Generate from title (last resort)
    const mergedSections = sections.map((newSection: any, index: number) => {
      const oldSection = existingSections[index];
      
      if (!oldSection) {
        // New section - prioritize section_key from payload (from defaultSections)
        // Only generate from title if section_key is truly missing
        return {
          ...newSection,
          section_key: (newSection.section_key && newSection.section_key.trim()) 
            ? newSection.section_key.trim() 
            : generateSectionKey(newSection.title || "")
        };
      }

      // Parse old props
      const oldProps = typeof oldSection.props === 'string' 
        ? JSON.parse(oldSection.props || '{}') 
        : oldSection.props || {};
      
      const newProps = newSection.props || {};

      // Deep merge: preserve old image paths if new section doesn't have /uploads/ paths
      const mergedProps = deepMergeImages(oldProps, newProps);

      // ✅ Priority: 1) section_key from payload (defaultSections), 2) from DB, 3) generate from title
      // This ensures section_key from defaultSections is always preserved
      const finalSectionKey = (newSection.section_key && newSection.section_key.trim())
        ? newSection.section_key.trim() // Use from payload (defaultSections) - highest priority
        : (oldSection.section_key && oldSection.section_key.trim())
          ? oldSection.section_key.trim() // Fallback to DB value
          : generateSectionKey(newSection.title || ""); // Last resort: generate from title

      return {
        ...newSection,
        section_key: finalSectionKey,
        props: mergedProps
      };
    });

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
          console.log(`🗑️ [SERVICE] Section image removed: ${key} (was: "${oldVal}")`);
          result[key] = null;
          return; // Skip further processing for this key
        }
        
        // If newVal already has a valid /uploads/ path, ALWAYS use it (don't merge)
        if (typeof newVal === 'string' && newVal.startsWith('/uploads/')) {
          result[key] = newVal;
          return; // Skip further processing for this key
        }

        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
          // Merge arrays element by element
          result[key] = newVal.map((item: any, idx: number) => {
            if (typeof item === 'object' && typeof oldVal[idx] === 'object') {
              return deepMergeImages(oldVal[idx], item);
            }
            return item;
          });
        } else if (typeof oldVal === 'object' && typeof newVal === 'object' && !Array.isArray(oldVal)) {
          // Recursively merge objects
          result[key] = deepMergeImages(oldVal, newVal);
        } else if (typeof newVal === 'string' && newVal && !newVal.startsWith('/uploads/')) {
          // If new value is not a valid path, check if old value is valid
          if (typeof oldVal === 'string' && oldVal.startsWith('/uploads/')) {
            // Preserve old valid image path
            result[key] = oldVal;
          }
        }
      });

      return result;
    }

    // 🧹 Clean old related data
    await conn.query(`DELETE FROM university_banners WHERE university_id = ?`, [id]);
    await conn.query(`DELETE FROM university_sections WHERE university_id = ?`, [id]);

    // 🖼 Re-insert merged banners
    console.log("🔍 [SERVICE] Merged banners before insert:", JSON.stringify(mergedBanners, null, 2));
    for (const b of mergedBanners) {
      console.log("🔍 [SERVICE] Inserting banner:", {
        university_id: id,
        banner_image: b.banner_image,
        video_id: b.video_id,
        video_title: b.video_title
      });
      await conn.query(
        `INSERT INTO university_banners (university_id, banner_image, video_id, video_title)
         VALUES (?, ?, ?, ?)`,
        [id, b.banner_image, b.video_id || null, b.video_title || null]
      );
    }

    // 🧩 Re-insert merged sections
    // ✅ section_key should already be set from mergedSections (from payload/defaultSections)
    for (const s of mergedSections) {
      // Use section_key from merged section (already prioritized: payload > DB > generated)
      // Only generate as last resort if somehow missing
      const sectionKey = (s.section_key && s.section_key.trim()) 
        ? s.section_key.trim() 
        : generateSectionKey(s.title || "");
      await conn.query(
        `INSERT INTO university_sections (university_id, section_key, title, component, props)
         VALUES (?, ?, ?, ?, ?)`,
        [id, sectionKey, s.title, s.component, JSON.stringify(s.props || {})]
      );
    }

    await conn.commit();

    const [rows]: any = await conn.query(
      `SELECT * FROM universities WHERE id = ?`,
      [id]
    );
    const universityData = { ...rows[0] };
    // Map is_page_created to menu_visibility
    if (universityData.is_page_created !== undefined) {
      universityData.menu_visibility = universityData.is_page_created === null || universityData.is_page_created === undefined ? true : Boolean(universityData.is_page_created);
      delete universityData.is_page_created;
    }
    return universityData;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getAllUniversities = async (page = 1, limit = 10, university_type_id?: number, search?: string) => {
  const offset = (page - 1) * limit;

  // 1️⃣ Fetch universities with latest first
  let query = `
    SELECT * 
    FROM universities 
  `;
  const queryParams: any[] = [];
  const conditions: string[] = [];

  // Add filter for university_type_id if provided
  if (university_type_id) {
    conditions.push(`university_type_id = ?`);
    queryParams.push(university_type_id);
  }

  // Add search filter if provided
  if (search && search.trim()) {
    conditions.push(`university_name LIKE ?`);
    queryParams.push(`%${search.trim()}%`);
  }

  // Add WHERE clause if there are any conditions
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')} `;
  }

  query += ` ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ? `;
  queryParams.push(limit, offset);

  const [universities]: any = await pool.query(query, queryParams);
  
  const uniIds = universities.map((u: any) => u.id);

  if (uniIds.length === 0) {
    return {
     data: [], page, pages: 0, total: 0 ,
    };
  }

  // 2️⃣ Fetch banners for these universities
  const [banners]: any = await pool.query(
    `SELECT * FROM university_banners WHERE university_id IN (?) ORDER BY id DESC`,
    [uniIds]
  );

  // 3️⃣ Fetch sections for these universities
  const [sections]: any = await pool.query(
    `SELECT * FROM university_sections WHERE university_id IN (?) ORDER BY id ASC`,
    [uniIds]
  );

  // 4️⃣ Collect all approval IDs from all universities
  const allApprovalIds = new Set<number>();
  universities.forEach((u: any) => {
    try {
      const approvalIds = JSON.parse(u.approval_id || '[]');
      if (Array.isArray(approvalIds)) {
        approvalIds.forEach(id => allApprovalIds.add(id));
      }
    } catch (e) {
      console.error('Error parsing approval_id:', e);
    }
  });

  // 5️⃣ Fetch all approvals at once
  let approvalsMap: Record<number, any> = {};
  if (allApprovalIds.size > 0) {
    const [approvals]: any = await pool.query(
      `SELECT id, title , logo, description FROM university_approvals WHERE id IN (?)`,
      [Array.from(allApprovalIds)]
    );
    approvals.forEach((approval: any) => {
      approvalsMap[approval.id] = approval;
    });
  }

  // 5.1️⃣ Collect all placement partner IDs from all universities
  const allPlacementPartnerIds = new Set<number>();
  universities.forEach((u: any) => {
    try {
      const partnerIds = JSON.parse(u.placement_partner_ids || '[]');
      if (Array.isArray(partnerIds)) {
        partnerIds.forEach(id => allPlacementPartnerIds.add(id));
      }
    } catch (e) {
      console.error('Error parsing placement_partner_ids:', e);
    }
  });

  // 5.2️⃣ Fetch all placement partners at once
  let placementPartnersMap: Record<number, any> = {};
  if (allPlacementPartnerIds.size > 0) {
    const [partners]: any = await pool.query(
      `SELECT id, name, logo FROM placement_partners WHERE id IN (?)`,
      [Array.from(allPlacementPartnerIds)]
    );
    partners.forEach((partner: any) => {
      placementPartnersMap[partner.id] = partner;
    });
  }

  // 5.3️⃣ Collect all EMI partner IDs from all universities
  const allEmiPartnerIds = new Set<number>();
  universities.forEach((u: any) => {
    try {
      const emiIds = JSON.parse(u.emi_partner_ids || '[]');
      if (Array.isArray(emiIds)) {
        emiIds.forEach(id => allEmiPartnerIds.add(id));
      }
    } catch (e) {
      console.error('Error parsing emi_partner_ids:', e);
    }
  });

  // 5.4️⃣ Fetch all EMI partners at once
  let emiPartnersMap: Record<number, any> = {};
  if (allEmiPartnerIds.size > 0) {
    const [emiPartners]: any = await pool.query(
      `SELECT id, name, logo FROM emi_partners WHERE id IN (?)`,
      [Array.from(allEmiPartnerIds)]
    );
    emiPartners.forEach((partner: any) => {
      emiPartnersMap[partner.id] = partner;
    });
  }

  // 6️⃣ Map banners, sections, approvals, and partners to universities
  const uniMap: Record<number, any> = {};
  universities.forEach((u: any) => {
    // Parse approval IDs
    let approvalIds = [];
    let approvals = [];
    try {
      approvalIds = JSON.parse(u.approval_id || '[]');
      if (Array.isArray(approvalIds)) {
        approvals = approvalIds
          .map((id: number) => approvalsMap[id])
          .filter(Boolean); // Remove any undefined values
      }
    } catch (e) {
      console.error('Error parsing approval_id:', e);
    }

    // Parse placement partner IDs
    let placementPartnerIds = [];
    let placementPartners = [];
    try {
      placementPartnerIds = JSON.parse(u.placement_partner_ids || '[]');
      console.log(`🔍 [getAllUniversities] University ${u.id} placement_partner_ids:`, u.placement_partner_ids);
      console.log(`🔍 [getAllUniversities] Parsed IDs:`, placementPartnerIds);
      if (Array.isArray(placementPartnerIds)) {
        placementPartners = placementPartnerIds
          .map((id: number) => placementPartnersMap[id])
          .filter(Boolean);
        console.log(`🔍 [getAllUniversities] Mapped partners:`, placementPartners);
      }
    } catch (e) {
      console.error('Error parsing placement_partner_ids:', e);
    }

    // Parse EMI partner IDs
    let emiPartnerIds = [];
    let emiPartners = [];
    try {
      emiPartnerIds = JSON.parse(u.emi_partner_ids || '[]');
      console.log(`🔍 [getAllUniversities] University ${u.id} emi_partner_ids:`, u.emi_partner_ids);
      console.log(`🔍 [getAllUniversities] Parsed EMI IDs:`, emiPartnerIds);
      if (Array.isArray(emiPartnerIds)) {
        emiPartners = emiPartnerIds
          .map((id: number) => emiPartnersMap[id])
          .filter(Boolean);
        console.log(`🔍 [getAllUniversities] Mapped EMI partners:`, emiPartners);
      }
    } catch (e) {
      console.error('Error parsing emi_partner_ids:', e);
    }

    // Parse compare information JSON fields
    let universityFeatures: any[] = [];
    let whyChoose: any[] = [];
    const compareInformation = parseCompareInformation(u.compare_information);
    try {
      if (u.university_features) {
        const parsed = JSON.parse(u.university_features);
        if (Array.isArray(parsed)) universityFeatures = parsed;
      }
    } catch (e) {
      console.error("Error parsing university_features:", e);
    }
    try {
      if (u.why_choose) {
        const parsed = JSON.parse(u.why_choose);
        if (Array.isArray(parsed)) whyChoose = parsed;
      }
    } catch (e) {
      console.error("Error parsing why_choose:", e);
    }

    uniMap[u.id] = {
      id: u.id,
      university_name: u.university_name,
      university_slug: u.university_slug,
      university_type_id: u.university_type_id,
      meta_title: u.meta_title,
      meta_description: u.meta_description,
      university_logo: u.university_logo,
      university_location: u.university_location,
      university_brochure: u.university_brochure,
      is_active: Boolean(u.is_active),
      // Expose is_page_created as a boolean for admin panel
      is_page_created:
        u.is_page_created === null || u.is_page_created === undefined
          ? true
          : Boolean(u.is_page_created),
      // Home page visibility flag
      menu_visibility:
        u.menu_visibility === null || u.menu_visibility === undefined
          ? true
          : Boolean(u.menu_visibility),
      // Provide EMI flag
      provide_emi:
        u.provide_emi === null || u.provide_emi === undefined
          ? false
          : Boolean(u.provide_emi),
      compare:
        u.compare === null || u.compare === undefined
          ? false
          : Boolean(u.compare),
      author_name: u.author_name,
      created_at: u.created_at,
      updated_at: u.updated_at,
      approval_id: u.approval_id, // Keep for admin frontend
      approvals: approvals, // Add approval objects for website
      placement_partner_ids: u.placement_partner_ids, // Keep for admin frontend
      placement_partners: placementPartners, // Add placement partner objects
      emi_partner_ids: u.emi_partner_ids, // Keep for admin frontend
      emi_partners: emiPartners, // Add EMI partner objects
      // Compare Information fields
      university_tag_line: u.university_tag_line || null,
      establishment_year: u.establishment_year || null,
      emi_provides: u.emi_provides === null || u.emi_provides === undefined ? false : Boolean(u.emi_provides),
      university_features: universityFeatures,
      education_mode: u.education_mode || null,
      admission_mode: u.admission_mode || null,
      examination_mode: u.examination_mode || null,
      scholarship_provides: u.scholarship_provides || null,
      alumni_status: u.alumni_status || null,
      online_classes: u.online_classes === null || u.online_classes === undefined ? false : Boolean(u.online_classes),
      placement_assistance:
        u.placement_assistance === null || u.placement_assistance === undefined
          ? false
          : Boolean(u.placement_assistance),
      why_choose: whyChoose,
      compare_information: compareInformation,
      banners: [],
      sections: [],
    };
  });

  // Attach banners
  banners.forEach((b: any) => {
    if (uniMap[b.university_id]) {
      uniMap[b.university_id].banners.push({
        id: b.id,
        banner_image: b.banner_image,
        video_id: b.video_id,
        video_title: b.video_title,
      });
    }
  });

  // Attach sections
  sections.forEach((s: any) => {
    if (uniMap[s.university_id]) {
      const rawProps = typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {};
      const normalizedProps = normalizeNullsToEmptyStrings(rawProps);
      uniMap[s.university_id].sections.push({
        id: s.id,
        title: s.title,
        component: s.component,
        props: normalizedProps,
      });
    }
  });

  // Maintain the original order from the SQL query
  const data = universities.map((u: any) => uniMap[u.id]);

  // 7️⃣ Total universities for pagination
  let countQuery = `SELECT COUNT(*) AS total FROM universities`;
  const countParams: any[] = [];
  const countConditions: string[] = [];
  
  if (university_type_id) {
    countConditions.push(`university_type_id = ?`);
    countParams.push(university_type_id);
  }
  
  if (search && search.trim()) {
    countConditions.push(`university_name LIKE ?`);
    countParams.push(`%${search.trim()}%`);
  }
  
  if (countConditions.length > 0) {
    countQuery += ` WHERE ${countConditions.join(' AND ')}`;
  }
  const [[{ total }]]: any = await pool.query(countQuery, countParams);

  return {
      data,
      page,
      pages: Math.ceil(total / limit),
      total,
    }
};

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

async function getUniversitySections(universityId: number) {
  const sections = await UniversitySectionService.getSectionsByUniversity(universityId);
  
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
    // Priority: content > first non-heading prop value > empty string
    let titleValue: any = "";
    let titleValueKey: string | null = null;
    let contentUsedForTitle = false;
    
    if (props.content !== undefined && props.content !== null && props.content !== "") {
      titleValue = props.content;
      titleValueKey = "content";
      contentUsedForTitle = true;
    } else if (Object.keys(props).length > 0) {
      // Use first non-heading prop value if no content
      const firstKey = Object.keys(props).find((k) => k !== "heading");
      if (firstKey) {
        titleValue = props[firstKey];
        titleValueKey = firstKey;
      }
    }
    
    // Set section_key as a key with its value
    if (sectionKey) {
      acc[sectionKey] = titleValue;
    }
    
    // Flatten props into the same object (excluding content/prop if it was used for section_key).
    // Section headings are namespaced as `${sectionKey}.heading` so they do not collide at the root.
    Object.keys(props).forEach((key) => {
      // Skip content/prop if it was already used as the section_key value to avoid duplication
      if ((key === "content" && contentUsedForTitle) || key === titleValueKey) {
        return; // Skip adding content/prop since it's already the section_key value
      }
      if (key === "heading" && sectionKey) {
        acc[`${sectionKey}.heading`] = props[key];
        return;
      }
      acc[key] = props[key];
    });

    return acc;
  }, {});
  
  // Return both formats separately
  return {
    sections_array: oldFormat, // Old format: array of section objects
    sections: newFormat, // New format: object with section_key as keys
  };
}

export const getUniversityById = async (id: number) => {
  const [rows]: any = await pool.query(
    `SELECT * FROM universities WHERE id = ?`,
    [id]
  );
  if (!rows.length) return null;

  const [banners]: any = await pool.query(
    `SELECT * FROM university_banners WHERE university_id = ?`,
    [id]
  );
  const sectionsData = await getUniversitySections(id);

  // Fetch approvals
  let approvals = [];
  try {
    const approvalIds = JSON.parse(rows[0].approval_id || '[]');
    if (Array.isArray(approvalIds) && approvalIds.length > 0) {
      const [approvalsData]: any = await pool.query(
        `SELECT id, title FROM university_approvals WHERE id IN (?)`,
        [approvalIds]
      );
      approvals = approvalsData;
    }
  } catch (e) {
    console.error('Error parsing approval_id:', e);
  }

  const universityData: any = { ...rows[0] };
  universityData.compare_information = parseCompareInformation(universityData.compare_information);
  // Normalize booleans
  if (universityData.is_page_created !== undefined) {
    universityData.is_page_created = Boolean(universityData.is_page_created);
  }
  if (universityData.is_active !== undefined) {
    universityData.is_active = Boolean(universityData.is_active);
  }
  if (universityData.menu_visibility !== undefined) {
    universityData.menu_visibility = Boolean(universityData.menu_visibility);
  }
  if (universityData.provide_emi !== undefined) {
    universityData.provide_emi = Boolean(universityData.provide_emi);
  }
  if (universityData.compare !== undefined) {
    universityData.compare = Boolean(universityData.compare);
  }

  // Parse compare information JSON fields for admin form
  universityData.compare_information = parseCompareInformation(universityData.compare_information);

  try {
    if (typeof universityData.university_features === "string") {
      const parsed = JSON.parse(universityData.university_features);
      universityData.university_features = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error("Error parsing university_features in getUniversityById:", e);
    universityData.university_features = [];
  }

  try {
    if (typeof universityData.why_choose === "string") {
      const parsed = JSON.parse(universityData.why_choose);
      universityData.why_choose = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error("Error parsing why_choose in getUniversityById:", e);
    universityData.why_choose = [];
  }

  // For admin, return plain object with sections as ARRAY (sections_array),
  // plus flattened sections object for optional uses.
  return {
    ...universityData,
    approvals,
    banners,
    sections: sectionsData.sections_array || [],
    sections_flat: sectionsData.sections || {},
  };
};

export const getUniversityBySlug = async (slug: string) => {
  const [rows]: any = await pool.query(
    `SELECT 
      u.*,
      ut.name AS university_type,
      a.image AS author_image,
      a.author_details AS author_details,
      a.author_slug AS author_slug,
      a.label AS author_label
    FROM universities u
    LEFT JOIN university_types ut ON u.university_type_id = ut.id
    LEFT JOIN authors a ON TRIM(LOWER(a.author_name)) = TRIM(LOWER(u.author_name))
    WHERE u.university_slug = ?`,
    [slug]
  );
  if (!rows.length) return null;

  const universityId = rows[0].id;

  const [banners]: any = await pool.query(
    `SELECT * FROM university_banners WHERE university_id = ?`,
    [universityId]
  );
  const sectionsData = await getUniversitySections(universityId);

  // Check if University_Faculties exists and first object has empty name and img
  if (sectionsData.sections && sectionsData.sections.University_Faculties) {
    const faculties = sectionsData.sections.University_Faculties;
    if (Array.isArray(faculties) && faculties.length > 0) {
      const firstFaculty = faculties[0];
      if (
        firstFaculty &&
        (firstFaculty.name === "" || firstFaculty.name === null || firstFaculty.name === undefined) &&
        (firstFaculty.img === "" || firstFaculty.img === null || firstFaculty.img === undefined)
      ) {
        sectionsData.sections.University_Faculties = [];
      }
    }
  }

  // Check if Student_Ratings exists and first object has empty name and reviewContent
  if (sectionsData.sections && sectionsData.sections.Student_Ratings && sectionsData.sections.Student_Ratings.length > 0) {
    const reviews = sectionsData.sections.Student_Ratings;
    if (Array.isArray(reviews) && reviews.length > 0) {
      const firstReview = reviews[0];
      if (firstReview && (firstReview.name === "" || firstReview.name === null || firstReview.name === undefined)) {
        sectionsData.sections.Student_Ratings = [];
      }
    }
  }

  // Fetch approvals
  let approvals = [];
  try {
    const approvalIds = JSON.parse(rows[0].approval_id || '[]');
    if (Array.isArray(approvalIds) && approvalIds.length > 0) {
      const [approvalsData]: any = await pool.query(
        `SELECT id, title, logo, description FROM university_approvals WHERE id IN (?)`,
        [approvalIds]
      );
      approvals = approvalsData;
    }
  } catch (e) {
    console.error('Error parsing approval_id:', e);
  }

  // Fetch placement partners
  let placementPartners = [];
  try {
    const partnerIds = JSON.parse(rows[0].placement_partner_ids || '[]');
    if (Array.isArray(partnerIds) && partnerIds.length > 0) {
      const [partnersData]: any = await pool.query(
        `SELECT id, name, logo FROM placement_partners WHERE id IN (?)`,
        [partnerIds]
      );
      placementPartners = partnersData;
    }
  } catch (e) {
    console.error('Error parsing placement_partner_ids:', e);
  }

  // Fetch EMI partners
  let emiPartners = [];
  try {
    const emiIds = JSON.parse(rows[0].emi_partner_ids || '[]');
    if (Array.isArray(emiIds) && emiIds.length > 0) {
      const [emiData]: any = await pool.query(
        `SELECT id, name, logo FROM emi_partners WHERE id IN (?)`,
        [emiIds]
      );
      emiPartners = emiData;
    }
  } catch (e) {
    console.error('Error parsing emi_partner_ids:', e);
  }

  // Fetch University FAQs grouped by category
  let universityFaqs = [];
  try {
    const [faqsData]: any = await pool.query(
      `SELECT 
        f.id,
        f.university_id,
        f.category_id,
        f.title,
        f.description,
        f.created_at,
        f.updated_at,
        c.heading as category_heading,
        c.priority as category_priority
      FROM university_faqs f
      LEFT JOIN university_faq_categories c ON f.category_id = c.id
      WHERE f.university_id = ?
      ORDER BY c.priority ASC, c.id ASC, f.created_at DESC`,
      [universityId]
    );

    // Group FAQs by category
    const faqsByCategory: { [key: number]: any } = {};
    faqsData.forEach((faq: any) => {
      const categoryId = faq.category_id;
      if (!faqsByCategory[categoryId]) {
        faqsByCategory[categoryId] = {
          category: faq.category_heading || 'Uncategorized',
          id: categoryId,
          cat_id: faq.category_heading || 'Uncategorized',
          priority: faq.category_priority || 999,
          items: []
        };
      }
      faqsByCategory[categoryId].items.push({
        id: faq.id,
        question: faq.title,
        answer: faq.description,
      });
    });

    // Convert to array format and sort by priority
    universityFaqs = Object.values(faqsByCategory).sort((a: any, b: any) => {
      const priorityA = a.priority ?? 999;
      const priorityB = b.priority ?? 999;
      return priorityA - priorityB;
    });
  } catch (e) {
    console.error('Error fetching university FAQs:', e);
  }

  // Fetch courses for this university
  let courseData = [];
  try {
    const [courses]: any = await pool.query(
      `SELECT 
        uc.id,
        uc.name,
        uc.label,
        uc.emi_duration,
        uc.slug,
        uc.duration,
        uc.course_thumbnail as image,
        uc.fee_type_values,
        uc.is_page_created,
        uc.compare_page_slug,
        COUNT(ucs.id) as specialization_count
      FROM university_courses uc
      LEFT JOIN university_course_specialization ucs ON uc.id = ucs.university_course_id
      WHERE uc.university_id = ? AND uc.is_active = 1
      GROUP BY uc.id, uc.name, uc.slug, uc.duration, uc.course_thumbnail, uc.fee_type_values, uc.emi_duration, uc.is_page_created, uc.compare_page_slug
      ORDER BY uc.created_at ASC`,
      [universityId]
    );

    // Format courses with full fee_type_values as fees
    courseData = courses.map((course: any) => {
      const fees = course.fee_type_values 
        ? (typeof course.fee_type_values === 'string' 
            ? JSON.parse(course.fee_type_values) 
            : course.fee_type_values)
        : null;

      return {
        name: course.name,
        slug: course.slug,
        label: course.label,
        emi_duration: course.emi_duration,
        duration: course.duration,
        image: course.image,
        specialization_count: Number(course.specialization_count) || 0,
        fees: fees,
        is_page_created: course.is_page_created == 1 ? true : false,
        compare_page_slug: course.compare_page_slug,
      };
    });
  } catch (e) {
    console.error('Error fetching university courses:', e);
  }

  const universityData: any = { ...rows[0] };
  universityData.compare_information = parseCompareInformation(universityData.compare_information);
  // Normalize booleans
  if (universityData.is_page_created !== undefined) {
    universityData.is_page_created = Boolean(universityData.is_page_created);
  }
  if (universityData.is_active !== undefined) {
    universityData.is_active = Boolean(universityData.is_active);
  }
  if (universityData.menu_visibility !== undefined) {
    universityData.menu_visibility = Boolean(universityData.menu_visibility);
  }
  if (universityData.provide_emi !== undefined) {
    universityData.provide_emi = Boolean(universityData.provide_emi);
  }
  if (universityData.compare !== undefined) {
    universityData.compare = Boolean(universityData.compare);
  }
  // Extract university type (can be null if not set)
  const universityType = universityData.university_type || null;

  const result = {  data: {
    ...universityData,
    university_type: universityType, // Add university type name
    // author: {
    //   name: universityData.author_name || null,
    //   image: universityData.author_image || null,
    //   details: universityData.author_details || null,
    //   slug: universityData.author_slug || null,
    //   label: universityData.author_label || null,
    // },
    approvals, // Add approval objects for website
    placement_partners: placementPartners, // Add placement partner objects
    emi_partners: emiPartners, // Add EMI partner objects
    banners,
    sections: sectionsData.sections || {},
    university_faqs: universityFaqs, // Add university FAQs grouped by category
    course_data: courseData, // Add course data
  }};
  
  return result;
};

export const deleteUniversity = async (id: number) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`DELETE FROM university_banners WHERE university_id = ?`, [id]);
    await conn.query(`DELETE FROM university_sections WHERE university_id = ?`, [id]);
    const [res]: any = await conn.query(`DELETE FROM universities WHERE id = ?`, [id]);

    await conn.commit();
    return res.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const toggleUniversityStatus = async (id: number, isActive: boolean) => {
  const conn = await pool.getConnection();
  try {
    const [result]: any = await conn.query(
      `UPDATE universities SET is_active = ? WHERE id = ?`,
      [isActive, id]
    );
    
    if (result.affectedRows === 0) return null;
    
    const [rows]: any = await conn.query(`SELECT * FROM universities WHERE id = ?`, [id]);
    return rows[0];
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const toggleUniversityPageCreated = async (id: number, isPageCreated: boolean) => {
  const conn = await pool.getConnection();
  try {
    const [result]: any = await conn.query(
      `UPDATE universities SET is_page_created = ? WHERE id = ?`,
      [isPageCreated ? 1 : 0, id]
    );
    
    if (result.affectedRows === 0) return null;
    
    const [rows]: any = await conn.query(`SELECT * FROM universities WHERE id = ?`, [id]);
  const universityData: any = { ...rows[0] };
  // Normalize booleans
  if (universityData.is_page_created !== undefined) {
    universityData.is_page_created = Boolean(universityData.is_page_created);
  }
  if (universityData.is_active !== undefined) {
    universityData.is_active = Boolean(universityData.is_active);
  }
  if (universityData.menu_visibility !== undefined) {
    universityData.menu_visibility = Boolean(universityData.menu_visibility);
  }
    return universityData;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const toggleUniversityMenuVisibility = async (id: number, menuVisibility: boolean) => {
  const conn = await pool.getConnection();
  try {
    const [result]: any = await conn.query(
      `UPDATE universities SET menu_visibility = ? WHERE id = ?`,
      [menuVisibility ? 1 : 0, id]
    );
    
    if (result.affectedRows === 0) return null;
    
    const [rows]: any = await conn.query(`SELECT * FROM universities WHERE id = ?`, [id]);
    const universityData: any = { ...rows[0] };
    // Normalize booleans
    if (universityData.is_page_created !== undefined) {
      universityData.is_page_created = Boolean(universityData.is_page_created);
    }
    if (universityData.is_active !== undefined) {
      universityData.is_active = Boolean(universityData.is_active);
    }
    if (universityData.menu_visibility !== undefined) {
      universityData.menu_visibility = Boolean(universityData.menu_visibility);
    }
    if (universityData.provide_emi !== undefined) {
      universityData.provide_emi = Boolean(universityData.provide_emi);
    }
    return universityData;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const toggleUniversityProvideEmi = async (id: number, provideEmi: boolean) => {
  const conn = await pool.getConnection();
  try {
    const [result]: any = await conn.query(
      `UPDATE universities SET provide_emi = ? WHERE id = ?`,
      [provideEmi ? 1 : 0, id]
    );
    
    if (result.affectedRows === 0) return null;
    
    const [rows]: any = await conn.query(`SELECT * FROM universities WHERE id = ?`, [id]);
    const universityData: any = { ...rows[0] };
    // Normalize booleans
    if (universityData.is_page_created !== undefined) {
      universityData.is_page_created = Boolean(universityData.is_page_created);
    }
    if (universityData.is_active !== undefined) {
      universityData.is_active = Boolean(universityData.is_active);
    }
    if (universityData.menu_visibility !== undefined) {
      universityData.menu_visibility = Boolean(universityData.menu_visibility);
    }
    if (universityData.provide_emi !== undefined) {
      universityData.provide_emi = Boolean(universityData.provide_emi);
    }
    if (universityData.compare !== undefined) {
      universityData.compare = Boolean(universityData.compare);
    }
    return universityData;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const toggleUniversityCompare = async (id: number, compare: boolean) => {
  const conn = await pool.getConnection();
  try {
    const [result]: any = await conn.query(
      `UPDATE universities SET \`compare\` = ? WHERE id = ?`,
      [compare ? 1 : 0, id]
    );

    if (result.affectedRows === 0) return null;

    const [rows]: any = await conn.query(`SELECT * FROM universities WHERE id = ?`, [id]);
    const universityData: any = { ...rows[0] };
    if (universityData.is_page_created !== undefined) {
      universityData.is_page_created = Boolean(universityData.is_page_created);
    }
    if (universityData.is_active !== undefined) {
      universityData.is_active = Boolean(universityData.is_active);
    }
    if (universityData.menu_visibility !== undefined) {
      universityData.menu_visibility = Boolean(universityData.menu_visibility);
    }
    if (universityData.provide_emi !== undefined) {
      universityData.provide_emi = Boolean(universityData.provide_emi);
    }
    if (universityData.compare !== undefined) {
      universityData.compare = Boolean(universityData.compare);
    }
    return universityData;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

export const fetchUniversitiesList = async () => {
  const data =  await UniversityRepo.fetchUniversitiesList();
  return{ data :data}
};