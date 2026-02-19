import pool from "../../config/db";

export interface CourseSearchResult {
  university_id: number;
  university_name: string;
  university_logo: string | null;
  course_slug: string;
  duration: string | null;
  emi_duration: number | null;
  label: string | null;
  syllabus_file: string | null;
  brochure_file: string | null;
  fee_types: Record<string, number> | null;
  approvals: any[];
  placement_partners: any[];
  emi_partners: any[];
  university_type_id: number | null;
  university_type: string | null;
  Student_Ratings: any[];
  // student_rating: number | null;
}

/**
 * Search universities by course slug
 * Returns universities that offer the specified course with their logo and fee types
 * Note: Student rating is currently commented out
 */
export async function searchUniversitiesByCourseSlug(
  courseSlug: string
): Promise<CourseSearchResult[]> {
  try {
    const [rows]: any = await pool.query(
      `SELECT 
        u.id AS university_id,
        u.university_name,
        u.university_logo,
        u.university_type_id,
        u.approval_id,
        u.placement_partner_ids,
        u.emi_partner_ids,
        ut.name AS university_type,
        uc.slug AS course_slug,
        uc.duration,
        uc.emi_duration,
        uc.label,
        uc.syllabus_file,
        uc.brochure_file,
        uc.fee_type_values
      FROM university_courses uc
      INNER JOIN universities u ON uc.university_id = u.id
      LEFT JOIN university_types ut ON u.university_type_id = ut.id
      WHERE LOWER(uc.slug) LIKE LOWER(?)
        AND uc.is_active = 1
        AND u.is_active = 1
      ORDER BY u.university_name ASC, uc.id ASC`,
      [courseSlug.trim()]
    );

    // Collect all unique university IDs for batch fetching
    const universityIds = [...new Set(rows.map((row: any) => row.university_id))];
    
    // Fetch approvals for all universities
    const allApprovalIds = new Set<number>();
    rows.forEach((row: any) => {
      try {
        const approvalIds = JSON.parse(row.approval_id || '[]');
        if (Array.isArray(approvalIds)) {
          approvalIds.forEach((id: number) => allApprovalIds.add(id));
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
    
    let approvalsMap: Record<number, any> = {};
    if (allApprovalIds.size > 0) {
      const [approvals]: any = await pool.query(
        `SELECT id, title, logo, description FROM university_approvals WHERE id IN (?)`,
        [Array.from(allApprovalIds)]
      );
      approvals.forEach((approval: any) => {
        approvalsMap[approval.id] = approval;
      });
    }
    
    // Fetch placement partners for all universities
    const allPlacementPartnerIds = new Set<number>();
    rows.forEach((row: any) => {
      try {
        const partnerIds = JSON.parse(row.placement_partner_ids || '[]');
        if (Array.isArray(partnerIds)) {
          partnerIds.forEach((id: number) => allPlacementPartnerIds.add(id));
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
    
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
    
    // Fetch EMI partners for all universities
    const allEmiPartnerIds = new Set<number>();
    rows.forEach((row: any) => {
      try {
        const emiIds = JSON.parse(row.emi_partner_ids || '[]');
        if (Array.isArray(emiIds)) {
          emiIds.forEach((id: number) => allEmiPartnerIds.add(id));
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
    
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
    
    // Fetch Student_Ratings sections for all universities
    let studentRatingsMap: Record<number, any[]> = {};
    if (universityIds.length > 0) {
      // Initialize all universities with empty array
      (universityIds as number[]).forEach((id: number) => {
        studentRatingsMap[id] = [];
      });
      
      const [sectionsRows]: any = await pool.query(
        `SELECT university_id, props, section_key
         FROM university_sections 
         WHERE university_id IN (?) AND (section_key = 'Student_Ratings' OR section_key = 'student_ratings')`,
        [universityIds]
      );
      
      sectionsRows.forEach((sectionRow: any) => {
        try {
          const props = typeof sectionRow.props === 'string' 
            ? JSON.parse(sectionRow.props || '{}') 
            : sectionRow.props || {};
          
          // Student_Ratings can be stored in different ways:
          // 1. props.content (array)
          // 2. props.Student_Ratings (array)
          // 3. props itself is an array
          // 4. First property value if it's an array
          let ratingsArray: any[] = [];
          
          if (Array.isArray(props)) {
            ratingsArray = props;
          } else if (props.content && Array.isArray(props.content)) {
            ratingsArray = props.content;
          } else if (props.Student_Ratings && Array.isArray(props.Student_Ratings)) {
            ratingsArray = props.Student_Ratings;
          } else if (typeof props === 'object' && Object.keys(props).length > 0) {
            // Try to find the first array value in props
            const firstKey = Object.keys(props)[0];
            if (Array.isArray(props[firstKey])) {
              ratingsArray = props[firstKey];
            }
          }
          
          // Filter out empty ratings (where name is empty)
          const validRatings = ratingsArray.filter((rating: any) => 
            rating && rating.name && rating.name.trim() !== ''
          );
          
          studentRatingsMap[sectionRow.university_id] = validRatings;
        } catch (e) {
          console.error('Error parsing Student_Ratings for university:', sectionRow.university_id, e);
          studentRatingsMap[sectionRow.university_id] = [];
        }
      });
    }

    const results: CourseSearchResult[] = rows.map((row: any) => {
      let feeTypes: Record<string, number> | null = null;
      if (row.fee_type_values) {
        try {
          feeTypes =
            typeof row.fee_type_values === "string"
              ? JSON.parse(row.fee_type_values)
              : row.fee_type_values;
        } catch (e) {
          feeTypes = null;
        }
      }
      
      // Get approvals for this university
      let approvals: any[] = [];
      try {
        const approvalIds = JSON.parse(row.approval_id || '[]');
        if (Array.isArray(approvalIds)) {
          approvals = approvalIds
            .map((id: number) => approvalsMap[id])
            .filter((approval: any) => approval !== undefined);
        }
      } catch (e) {
        approvals = [];
      }
      
      // Get placement partners for this university
      let placementPartners: any[] = [];
      try {
        const partnerIds = JSON.parse(row.placement_partner_ids || '[]');
        if (Array.isArray(partnerIds)) {
          placementPartners = partnerIds
            .map((id: number) => placementPartnersMap[id])
            .filter((partner: any) => partner !== undefined);
        }
      } catch (e) {
        placementPartners = [];
      }
      
      // Get EMI partners for this university
      let emiPartners: any[] = [];
      try {
        const emiIds = JSON.parse(row.emi_partner_ids || '[]');
        if (Array.isArray(emiIds)) {
          emiPartners = emiIds
            .map((id: number) => emiPartnersMap[id])
            .filter((partner: any) => partner !== undefined);
        }
      } catch (e) {
        emiPartners = [];
      }
      
      // Get Student_Ratings for this university
      const studentRatings = studentRatingsMap[row.university_id] || [];

      return {
        university_id: row.university_id,
        university_name: row.university_name,
        university_logo: row.university_logo,
        course_slug: row.course_slug || "",
        duration: row.duration || null,
        emi_duration: row.emi_duration || null,
        label: row.label || null,
        syllabus_file: row.syllabus_file || null,
        brochure_file: row.brochure_file || null,
        fee_types: feeTypes,
        approvals: approvals,
        placement_partners: placementPartners,
        emi_partners: emiPartners,
        university_type_id: row.university_type_id || null,
        university_type: row.university_type || null,
        Student_Ratings: studentRatings,
      };
    });

    const resultMap = new Map<string, CourseSearchResult>();

    results.forEach((result) => {
      const key = `${result.university_id}_${result.course_slug}`;
      const existing = resultMap.get(key);
      if (!existing) {
        resultMap.set(key, result);
      } else {
        if (result.fee_types) {
          existing.fee_types = {
            ...existing.fee_types,
            ...result.fee_types,
          };
        }
      }
    });

    return Array.from(resultMap.values());
  } catch (error) {
    console.error("❌ Error searching universities by course name:", error);
    throw error;
  }
}

