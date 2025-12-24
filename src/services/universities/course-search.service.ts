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
 * Search universities by course name
 * Returns universities that offer the specified course with their logo and fee types
 * Note: Student rating is currently commented out
 */
export async function searchUniversitiesByCourseName(
  courseName: string
): Promise<CourseSearchResult[]> {
  try {
    const searchTerm = `%${courseName.trim()}%`;

    // Query to find university courses matching the course name
    // Join with universities to get logo and name
    // Join with sections to get student ratings (commented out for now)
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
      WHERE LOWER(uc.name) LIKE LOWER(?)
        AND uc.is_active = 1
        AND u.is_active = 1
      ORDER BY u.university_name ASC, uc.id ASC`,
      [searchTerm]
    );

    // Process results to extract student rating and format fee types
    const results: CourseSearchResult[] = rows.map((row: any) => {
      // Parse fee_type_values (stored as JSON string)
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

      // Extract student rating from sections props (commented out for now)
      // let studentRating: number | null = null;
      // if (row.student_ratings_props) {
      //   try {
      //     const props =
      //       typeof row.student_ratings_props === "string"
      //         ? JSON.parse(row.student_ratings_props)
      //         : row.student_ratings_props;

      //     // Check if props has allReviews array
      //     if (props?.allReviews && Array.isArray(props.allReviews)) {
      //       const ratings = props.allReviews
      //         .map((review: any) => {
      //           // Rating can be in "rating (1-5)" field or "rating" field
      //           const ratingValue =
      //             review["rating (1-5)"] || review.rating || null;
      //           if (ratingValue) {
      //             const num = parseFloat(String(ratingValue));
      //             return !isNaN(num) && num >= 1 && num <= 5 ? num : null;
      //           }
      //           return null;
      //         })
      //         .filter((r: number | null) => r !== null) as number[];

      //       if (ratings.length > 0) {
      //         // Calculate average rating
      //         studentRating =
      //           ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      //         // Round to 1 decimal place
      //         studentRating = Math.round(studentRating * 10) / 10;
      //       }
      //     }
      //   } catch (e) {
      //     // If parsing fails, rating remains null
      //     studentRating = null;
      //   }
      // }

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
        // student_rating: studentRating,
      };
    });

    // Group by university_id and course_slug to handle multiple courses per university
    // If same university has multiple matching courses, return all of them
    const resultMap = new Map<string, CourseSearchResult>();

    results.forEach((result) => {
      const key = `${result.university_id}_${result.course_slug}`;
      const existing = resultMap.get(key);
      if (!existing) {
        resultMap.set(key, result);
      } else {
        // If same course appears multiple times, merge fee types
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

