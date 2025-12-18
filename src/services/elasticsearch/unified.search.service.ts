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

    // Combine all results into a single array
    const allResults: any[] = [];
    
    // Add universities with type in _source, and extract their courses and specializations
    if (Array.isArray(universitiesResult)) {
      universitiesResult.forEach((item: any) => {
        const universitySlug = item._source?.slug || item._source?.university_slug || '';
        
        // Add the university itself
        allResults.push({
          _index: item._index || 'universities',
          _id: item._id,
          _score: item._score || 0,
          _source: {
            name: item._source?.name || item._source?.university_name || '',
            slug: universitySlug,
            search_keywords: item._source?.search_keywords || '',
            type: 'university',
            status: item._source?.status || (item._source?.is_active ? 1 : 0),
            university_slug: universitySlug,
            course_slug: null
          },
          highlight: item.highlight || {}
        });
        
        // Extract courses from university's _source.courses
        const courses = item._source?.courses || [];
        courses.forEach((course: any) => {
          allResults.push({
            _index: 'university_courses',
            _id: course.id?.toString() || `course_${course.id}`,
            _score: (item._score || 0) * 0.9, // Slightly lower score than university
            _source: {
              name: course.name || '',
              slug: course.slug || '',
              search_keywords: '',
              type: 'university_course',
              status: 1,
            //   university_slug: universitySlug,
            //   course_slug: course.slug || null
            },
            highlight: {}
          });
          
          // Extract specializations from each course
          const specializations = course.specializations || [];
          specializations.forEach((spec: any) => {
            allResults.push({
              _index: 'university_course_specializations',
              _id: spec.id?.toString() || `spec_${spec.id}`,
              _score: (item._score || 0) * 0.8, // Even lower score than course
              _source: {
                name: spec.name || '',
                slug: spec.slug || '',
                search_keywords: '',
                type: 'university_course_specialization',
                status: 1,
                university_slug: universitySlug,
                course_slug: course.slug || null
              },
              highlight: {}
            });
          });
        });
      });
    }
    
    // Add courses with type in _source
    if (Array.isArray(coursesResult)) {
      coursesResult.forEach((item: any) => {
        allResults.push({
          _index: item._index || 'courses',
          _id: item._id,
          _score: item._score || 0,
          _source: {
            name: item._source?.name || '',
            slug: item._source?.slug || '',
            search_keywords: item._source?.search_keywords || '',
            type: 'course',
            status: item._source?.status || (item._source?.is_active ? 1 : 0),
            university_slug: null,
            course_slug: null
          },
          highlight: item.highlight || {}
        });
      });
    }
    
    // Add university courses with type in _source
    if (Array.isArray(universityCoursesResult)) {
      universityCoursesResult.forEach((item: any) => {
        allResults.push({
          _index: item._index || 'university_courses',
          _id: item._id,
          _score: item._score || 0,
          _source: {
            name: item._source?.name || '',
            slug: item._source?.slug || '',
            search_keywords: item._source?.search_keywords || '',
            type: 'university_course',
            status: item._source?.status || (item._source?.is_active ? 1 : 0),
            // university_slug: item._source?.university_slug || null,
            // course_slug: item._source?.course_slug || null
          },
          highlight: item.highlight || {}
        });
      });
    }
    
    // Add specializations with type in _source
    if (Array.isArray(specializationsResult)) {
      specializationsResult.forEach((item: any) => {
        allResults.push({
          _index: item._index || 'specializations',
          _id: item._id,
          _score: item._score || 0,
          _source: {
            name: item._source?.name || '',
            slug: item._source?.slug || '',
            search_keywords: item._source?.search_keywords || '',
            type: 'specialization',
            status: item._source?.status || (item._source?.is_active ? 1 : 0),
            university_slug: null,
            course_slug: null
          },
          highlight: item.highlight || {}
        });
      });
    }
    
    // Add university course specializations with type in _source
    if (Array.isArray(universityCourseSpecializationsResult)) {
      universityCourseSpecializationsResult.forEach((item: any) => {
        allResults.push({
          _index: item._index || 'university_course_specializations',
          _id: item._id,
          _score: item._score || 0,
          _source: {
            name: item._source?.name || '',
            slug: item._source?.slug || '',
            search_keywords: item._source?.search_keywords || '',
            type: 'university_course_specialization',
            status: item._source?.status || (item._source?.is_active ? 1 : 0),
            university_slug: item._source?.university_slug || null,
            course_slug: item._source?.course_slug || null
          },
          highlight: item.highlight || {}
        });
      });
    }

    // Sort by score (highest first)
    allResults.sort((a, b) => (b._score || 0) - (a._score || 0));

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

