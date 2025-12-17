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
  data: any[];
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

    // Combine all results with their type and score for sorting
    const allResultsWithScore: Array<{ item: any; type: string; score: number }> = [];
    
    // Add universities with type, and extract their courses and specializations
    if (Array.isArray(universitiesResult)) {
      universitiesResult.forEach((item: any) => {
        // Add the university itself
        allResultsWithScore.push({
          item,
          type: 'university',
          score: item._score || 0
        });
        
        // Extract courses from university's _source.courses
        const courses = item._source?.courses || [];
        courses.forEach((course: any) => {
          allResultsWithScore.push({
            item: {
              _source: {
                id: course.id || null,
                name: course.name,
                slug: course.slug
              },
              _score: item._score * 0.9 // Slightly lower score than university
            },
            type: 'university_course',
            score: item._score * 0.9
          });
          
          // Extract specializations from each course
          const specializations = course.specializations || [];
          specializations.forEach((spec: any) => {
            allResultsWithScore.push({
              item: {
                _source: {
                  id: spec.id || null,
                  name: spec.name,
                  slug: spec.slug
                },
                _score: item._score * 0.8 // Even lower score than course
              },
              type: 'university_course_specialization',
              score: item._score * 0.8
            });
          });
        });
      });
    }
    
    // Add courses with type
    if (Array.isArray(coursesResult)) {
      coursesResult.forEach((item: any) => {
        allResultsWithScore.push({
          item,
          type: 'course',
          score: item._score || 0
        });
      });
    }
    
    // Add university courses with type
    if (Array.isArray(universityCoursesResult)) {
      universityCoursesResult.forEach((item: any) => {
        allResultsWithScore.push({
          item,
          type: 'university_course',
          score: item._score || 0
        });
      });
    }
    
    // Add specializations with type
    if (Array.isArray(specializationsResult)) {
      specializationsResult.forEach((item: any) => {
        allResultsWithScore.push({
          item,
          type: 'specialization',
          score: item._score || 0
        });
      });
    }
    
    // Add university course specializations with type
    if (Array.isArray(universityCourseSpecializationsResult)) {
      universityCourseSpecializationsResult.forEach((item: any) => {
        allResultsWithScore.push({
          item,
          type: 'university_course_specialization',
          score: item._score || 0
        });
      });
    }

    // Normalize query for exact match comparison (lowercase, trim)
    const normalizedQuery = query.toLowerCase().trim();
    
    // Helper function to check if name exactly matches query (case-insensitive)
    const isExactMatch = (name: string): boolean => {
      if (!name) return false;
      const normalizedName = name.toLowerCase().trim();
      return normalizedName === normalizedQuery;
    };

    // Sort: exact matches first, then by score
    allResultsWithScore.sort((a, b) => {
      const nameA = a.item._source?.name || a.item._source?.university_name || '';
      const nameB = b.item._source?.name || b.item._source?.university_name || '';
      
      const exactMatchA = isExactMatch(nameA);
      const exactMatchB = isExactMatch(nameB);
      
      // If one is exact match and other is not, exact match comes first
      if (exactMatchA && !exactMatchB) return -1;
      if (!exactMatchA && exactMatchB) return 1;
      
      // If both are exact matches or both are partial, sort by score
      return b.score - a.score;
    });

    // Transform to final format with id, name, slug, and type
    const allResults = allResultsWithScore.map(({ item, type }) => ({
      id: item._source?.id || null,
      name: item._source?.name || item._source?.university_name || '',
      slug: item._source?.slug || item._source?.university_slug || '',
      type: type
    }));

    // Calculate total results
    const total = allResults.length;

    return {
      data: allResults,
      total,
      took: 0 // Could calculate actual time if needed
    };
  } catch (error) {
    console.error('❌ Error in unified search:', error);
    throw error;
  }
}

