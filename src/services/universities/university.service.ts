import pool from "../../config/db";
import { RowDataPacket } from "mysql2";
import { UniversityRepo } from "../../repositories/universities/university.repository";
import UniversitySectionService from "./university_section.service";

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
    university_logo = ?, 
    university_location = ?, 
    university_brochure = ?, 
    author_name = ?, 
    is_active = ?, 
    approval_id = ?,
    placement_partner_ids = ?,
    emi_partner_ids = ?
`;

const params = [
  updateData.university_name,
  updateData.university_slug,
  universityLogo,
  updateData.university_location || null,
  universityBrochure,
  updateData.author_name || null,

  // ✅ FIX: Convert string "false" or false to actual boolean false
  updateData.is_active === "false" || updateData.is_active === false ? 0 : 1,

  updateData.approval_id || "[]",
  updateData.placement_partner_ids || "[]",
  updateData.emi_partner_ids || "[]",
];

// ✅ Only include updated_at if saveWithDate = true
if (updateData.saveWithDate === true || updateData.saveWithDate === "true") {
  sql += `, updated_at = NOW()`;
}

sql += ` WHERE id = ?`;
params.push(id);

await conn.query(sql, params);



    // 🧩 Merge sections - preserve old images for unchanged sections
    const mergedSections = sections.map((newSection: any, index: number) => {
      const oldSection = existingSections[index];
      
      if (!oldSection) {
        // New section, use as-is
        return newSection;
      }

      // Parse old props
      const oldProps = typeof oldSection.props === 'string' 
        ? JSON.parse(oldSection.props || '{}') 
        : oldSection.props || {};
      
      const newProps = newSection.props || {};

      // Deep merge: preserve old image paths if new section doesn't have /uploads/ paths
      const mergedProps = deepMergeImages(oldProps, newProps);

      return {
        ...newSection,
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
    for (const s of mergedSections) {
      await conn.query(
        `INSERT INTO university_sections (university_id, title, component, props)
         VALUES (?, ?, ?, ?)`,
        [id, s.title, s.component, JSON.stringify(s.props || {})]
      );
    }

    await conn.commit();

    const [rows]: any = await conn.query(
      `SELECT * FROM universities WHERE id = ?`,
      [id]
    );
    return rows[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getAllUniversities = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  // 1️⃣ Fetch universities with latest first
  const [universities]: any = await pool.query(
    `
    SELECT * 
    FROM universities 
    ORDER BY created_at DESC, id DESC 
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );
  
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

    uniMap[u.id] = {
        id: u.id,
        university_name: u.university_name,
        university_slug: u.university_slug,
        university_logo: u.university_logo,
        university_location: u.university_location,
        university_brochure: u.university_brochure,
        is_active: u.is_active,
        author_name: u.author_name,
        created_at: u.created_at,
        updated_at: u.updated_at,
        approval_id: u.approval_id, // Keep for admin frontend
        approvals: approvals, // Add approval objects for website
        placement_partner_ids: u.placement_partner_ids, // Keep for admin frontend
        placement_partners: placementPartners, // Add placement partner objects
        emi_partner_ids: u.emi_partner_ids, // Keep for admin frontend
        emi_partners: emiPartners, // Add EMI partner objects
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
      uniMap[s.university_id].sections.push({
        id: s.id,
        title: s.title,
        component: s.component,
        props: typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {},
      });
    }
  });

  // Maintain the original order from the SQL query
  const data = universities.map((u: any) => uniMap[u.id]);

  // 7️⃣ Total universities for pagination
  const [[{ total }]]: any = await pool.query(`SELECT COUNT(*) AS total FROM universities`);

  return {
      data,
      page,
      pages: Math.ceil(total / limit),
      total,
    }
};

async function getUniversitySections(universityId: number) {
  const sections = await UniversitySectionService.getSectionsByUniversity(universityId);
  
  // Old format: keep original structure
  const oldFormat = sections.map((s: any) => ({
    id: s.id,
    title: s.title,
    component: s.component,
    props: typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {},
  }));
  
  // New transformed format: title as key, props flattened
  const newFormat = sections.map((s: any) => {
    const props = typeof s.props === "string" ? JSON.parse(s.props || "{}") : s.props || {};
    const title = s.title || "";
    
    // Create object with title as the first key
    const result: Record<string, any> = {};
    
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
    
    // Set title as the first key with its value
    result[title] = titleValue;
    
    // Flatten ALL props into the same object (excluding content if it was used for title)
    // This preserves all props like videoID, videoTitle, gridContent, faculties, etc.
    Object.keys(props).forEach((key) => {
      // Skip content if it was already used as the title value to avoid duplication
      if (key === "content" && contentUsedForTitle) {
        return; // Skip adding content since it's already the title value
      }
      result[key] = props[key];
    });
    
    return result;
  });
  
  // Return both formats separately
  return {
    sections: oldFormat,
    sections_transformed: newFormat,
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

  return {  data: {
    ...rows[0],
    approvals, // Add approval objects for website
    banners,
    sections: sectionsData.sections || [],
    sections_transformed: sectionsData.sections_transformed || [],
  }};
};

export const getUniversityBySlug = async (slug: string) => {
  const [rows]: any = await pool.query(
    `SELECT * FROM universities WHERE university_slug = ?`,
    [slug]
  );
  if (!rows.length) return null;

  const universityId = rows[0].id;

  const [banners]: any = await pool.query(
    `SELECT * FROM university_banners WHERE university_id = ?`,
    [universityId]
  );
  const sectionsData = await getUniversitySections(universityId);

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
        c.heading as category_heading
      FROM university_faqs f
      LEFT JOIN university_faq_categories c ON f.category_id = c.id
      WHERE f.university_id = ?
      ORDER BY c.id, f.created_at DESC`,
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
          items: []
        };
      }
      faqsByCategory[categoryId].items.push({
        id: faq.id,
        question: faq.title,
        answer: faq.description,
      });
    });

    // Convert to array format
    universityFaqs = Object.values(faqsByCategory);
  } catch (e) {
    console.error('Error fetching university FAQs:', e);
  }

  // Fetch courses for this university
  let courseData = [];
  try {
    const [courses]: any = await pool.query(
      `SELECT 
        id,
        name,
        slug,
        duration,
        course_thumbnail as image,
        fee_type_values
      FROM university_courses 
      WHERE university_id = ? AND is_active = 1
      ORDER BY created_at ASC`,
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
        duration: course.duration,
        image: course.image,
        fees: fees
      };
    });
  } catch (e) {
    console.error('Error fetching university courses:', e);
  }

  const result = {  data: {
    ...rows[0],
    approvals, // Add approval objects for website
    placement_partners: placementPartners, // Add placement partner objects
    emi_partners: emiPartners, // Add EMI partner objects
    banners,
    // ...sections.reduce((acc: any, s: any) => {
    //   acc[s.title.toLowerCase()] = s.props;
    //   return acc;
    // }, {}),   
    sections: sectionsData.sections || [],
    sections_transformed: sectionsData.sections_transformed || [],
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

export const fetchUniversitiesList = async () => {
  return await UniversityRepo.fetchUniversitiesList();
};