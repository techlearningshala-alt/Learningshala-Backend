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
        uc.slug AS course_slug,
        uc.duration,
        uc.emi_duration,
        uc.label,
        uc.syllabus_file,
        uc.brochure_file,
        uc.fee_type_values
      FROM university_courses uc
      INNER JOIN universities u ON uc.university_id = u.id
      WHERE LOWER(uc.slug) LIKE LOWER(?)
        AND uc.is_active = 1
        AND u.is_active = 1
      ORDER BY u.university_name ASC, uc.id ASC`,
      [courseSlug.trim()]
    );

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

