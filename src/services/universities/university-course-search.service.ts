import pool from "../../config/db";
import courseRepo from "../../repositories/universities/university_course.repository";

interface CourseSearchResult {
  university_id: number;
  university_name: string;
  university_logo: string | null;
  university_slug: string;
  course_id: number;
  course_name: string;
  fee_type_values: Record<string, number> | null;
  student_rating: number | null;
}

/**
 * Extract student rating from sections
 * Looks for section with section_key = "student_ratings" and calculates average rating
 */
function extractStudentRating(sections: any[]): number | null {
  const ratingSection = sections.find(
    (section) => section.section_key === "student_ratings"
  );

  if (!ratingSection || !ratingSection.props) {
    return null;
  }

  try {
    const props = typeof ratingSection.props === "string"
      ? JSON.parse(ratingSection.props)
      : ratingSection.props;

    if (!props.allReviews || !Array.isArray(props.allReviews)) {
      return null;
    }

    // Extract ratings from allReviews array
    const ratings = props.allReviews
      .map((review: any) => {
        // Rating can be in "rating (1-5)" key (mapped to "value") or directly as "value"
        const ratingValue = review.value || review["rating (1-5)"] || review.rating;
        const numRating = Number(ratingValue);
        return !isNaN(numRating) && numRating > 0 && numRating <= 5 ? numRating : null;
      })
      .filter((rating: number | null): rating is number => rating !== null);

    if (ratings.length === 0) {
      return null;
    }

    // Calculate average rating
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error("Error parsing student rating:", error);
    return null;
  }
}

/**
 * Search universities by course name
 * Returns universities offering the course with logo, name, fee types, and student ratings
 */
export async function searchUniversitiesByCourseName(courseName: string): Promise<CourseSearchResult[]> {
  if (!courseName || typeof courseName !== "string" || !courseName.trim()) {
    return [];
  }

  // Get all university courses matching the course name
  const courses = await courseRepo.findByCourseName(courseName);

  if (!courses || courses.length === 0) {
    return [];
  }

  // Get course IDs
  const courseIds = courses.map((course: any) => course.course_id);

  // Fetch all sections for these courses
  const [sectionsRows]: any = await pool.query(
    `SELECT course_id, section_key, props 
     FROM university_course_sections 
     WHERE course_id IN (?) AND section_key = 'student_ratings'`,
    [courseIds]
  );

  // Group sections by course_id
  const sectionsByCourseId = new Map<number, any[]>();
  sectionsRows.forEach((section: any) => {
    if (!sectionsByCourseId.has(section.course_id)) {
      sectionsByCourseId.set(section.course_id, []);
    }
    sectionsByCourseId.get(section.course_id)!.push(section);
  });

  // Build response
  const results: CourseSearchResult[] = courses.map((course: any) => {
    const sections = sectionsByCourseId.get(course.course_id) || [];
    const studentRating = extractStudentRating(sections);

    // Parse fee_type_values if it's a string
    let feeTypeValues: Record<string, number> | null = null;
    if (course.fee_type_values) {
      try {
        feeTypeValues = typeof course.fee_type_values === "string"
          ? JSON.parse(course.fee_type_values)
          : course.fee_type_values;
      } catch (error) {
        console.error("Error parsing fee_type_values:", error);
        feeTypeValues = null;
      }
    }

    return {
      university_id: course.university_id,
      university_name: course.university_name,
      university_logo: course.university_logo || null,
      university_slug: course.university_slug,
      course_id: course.course_id,
      course_name: course.course_name,
      fee_type_values: feeTypeValues,
      student_rating: studentRating,
    };
  });

  return results;
}

