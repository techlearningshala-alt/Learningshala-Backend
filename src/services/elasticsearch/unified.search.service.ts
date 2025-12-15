import { searchUniversities } from './university.search.service';
import { searchCourses } from './course.search.service';
import { searchUniversityCourses } from './university-course.search.service';
import { searchSpecializations } from './specialization.search.service';
import { searchUniversityCourseSpecializations } from './university-course-specialization.search.service';

/**
 * Unified Search Service
 * Searches across all entities (universities, courses, university courses, specializations, university course specializations)
 * and returns results grouped by type
 */

export interface UnifiedSearchOptions {
  page?: number;
  limit?: number;
  filters?: {
    // University filters
    university_is_active?: boolean;
    university_approval_id?: number;
    // Course filters
    course_is_active?: boolean;
    course_domain_id?: number;
    // University course filters
    university_course_is_active?: boolean;
    university_course_university_id?: number;
    // Specialization filters
    specialization_is_active?: boolean;
    specialization_course_id?: number;
    // University course specialization filters
    university_course_specialization_university_course_id?: number;
  };
}

export interface UnifiedSearchResult {
  universities: any[];
  courses: any[];
  university_courses: any[];
  specializations: any[];
  university_course_specializations: any[];
  total: number;
  took: number;
}

/**
 * Unified search across all entities
 */
export async function unifiedSearch(
  query: string,
  options: UnifiedSearchOptions = {}
): Promise<UnifiedSearchResult> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    
    // Search all entities in parallel for better performance
    const [
      universitiesResult,
      coursesResult,
      universityCoursesResult,
      specializationsResult,
      universityCourseSpecializationsResult
    ] = await Promise.all([
      // Search universities
      searchUniversities(query, {
        page,
        limit,
        filters: {
          is_active: options.filters?.university_is_active,
          approval_id: options.filters?.university_approval_id
        }
      }).catch(err => {
        console.error('⚠️ Error searching universities:', err);
        return [];
      }),
      
      // Search courses
      searchCourses(query, {
        page,
        limit,
        filters: {
          is_active: options.filters?.course_is_active,
          domain_id: options.filters?.course_domain_id
        }
      }).catch(err => {
        console.error('⚠️ Error searching courses:', err);
        return [];
      }),
      
      // Search university courses
      searchUniversityCourses(query, {
        page,
        limit,
        filters: {
          is_active: options.filters?.university_course_is_active,
          university_id: options.filters?.university_course_university_id
        }
      }).catch(err => {
        console.error('⚠️ Error searching university courses:', err);
        return [];
      }),
      
      // Search specializations
      searchSpecializations(query, {
        page,
        limit,
        filters: {
          is_active: options.filters?.specialization_is_active,
          course_id: options.filters?.specialization_course_id
        }
      }).catch(err => {
        console.error('⚠️ Error searching specializations:', err);
        return [];
      }),
      
      // Search university course specializations
      searchUniversityCourseSpecializations(query, {
        page,
        limit,
        filters: {
          university_course_id: options.filters?.university_course_specialization_university_course_id
        }
      }).catch(err => {
        console.error('⚠️ Error searching university course specializations:', err);
        return [];
      })
    ]);

    // Calculate total results
    const total = 
      (Array.isArray(universitiesResult) ? universitiesResult.length : 0) +
      (Array.isArray(coursesResult) ? coursesResult.length : 0) +
      (Array.isArray(universityCoursesResult) ? universityCoursesResult.length : 0) +
      (Array.isArray(specializationsResult) ? specializationsResult.length : 0) +
      (Array.isArray(universityCourseSpecializationsResult) ? universityCourseSpecializationsResult.length : 0);

    return {
      universities: Array.isArray(universitiesResult) ? universitiesResult : [],
      courses: Array.isArray(coursesResult) ? coursesResult : [],
      university_courses: Array.isArray(universityCoursesResult) ? universityCoursesResult : [],
      specializations: Array.isArray(specializationsResult) ? specializationsResult : [],
      university_course_specializations: Array.isArray(universityCourseSpecializationsResult) ? universityCourseSpecializationsResult : [],
      total,
      took: 0 // Could calculate actual time if needed
    };
  } catch (error) {
    console.error('❌ Error in unified search:', error);
    throw error;
  }
}

