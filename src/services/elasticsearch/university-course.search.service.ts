import esClient from '../../config/elasticsearch';

// Index name for university courses
const INDEX_NAME = 'university_courses';

/**
 * Elasticsearch Service for University Courses
 * This service handles all Elasticsearch operations for university courses
 */

/**
 * Create the university courses index with mapping
 * This defines the structure of documents in Elasticsearch
 */
export async function createUniversityCourseIndex() {
  try {
    // Check if index already exists
    const exists = await esClient.indices.exists({ index: INDEX_NAME });
    
    if (exists) {
      console.log(`📦 Index "${INDEX_NAME}" already exists`);
      return;
    }

    // Create index with mapping
    await esClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          id: { type: 'integer' },
          university_id: { type: 'integer' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' } // For exact matches and prefix queries
            }
          },
          slug: { type: 'keyword' },
          course_thumbnail: { type: 'keyword' },
          h1Tag: { type: 'text' },
          label: { type: 'text' },
          duration: { type: 'text' },
          emi_duration: { type: 'integer' },
          author_name: { type: 'text' },
          university_name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          is_active: { type: 'boolean' },
          is_page_created: { type: 'boolean' },
          syllabus_file: { type: 'keyword' },
          brochure_file: { type: 'keyword' },
          university_slug: { type: 'keyword' },
          created_at: { type: 'date' },
          updated_at: { type: 'date' }
        }
      }
    });

    console.log(`✅ Index "${INDEX_NAME}" created successfully`);
  } catch (error: any) {
    if (error.meta?.body?.error?.type === 'resource_already_exists_exception') {
      console.log(`📦 Index "${INDEX_NAME}" already exists`);
    } else {
      console.error('❌ Error creating index:', error);
      throw error;
    }
  }
}

/**
 * Index a university course document (add or update)
 */
export async function indexUniversityCourse(course: any) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: course.id.toString(), // Use course ID as document ID
      body: {
        id: course.id,
        university_id: course.university_id || null,
        name: course.name,
        slug: course.slug,
        course_thumbnail: course.course_thumbnail || null,
        h1Tag: course.h1Tag || null,
        label: course.label || null,
        duration: course.duration || null,
        emi_duration: course.emi_duration || null,
        author_name: course.author_name || null,
        university_name: course.university_name || null,
        is_active: Boolean(course.is_active),
        is_page_created: Boolean(course.is_page_created),
        syllabus_file: course.syllabus_file || null,
        brochure_file: course.brochure_file || null,
        university_slug: course.university_slug || null,
        created_at: course.created_at,
        updated_at: course.updated_at || new Date()
      }
    });

    // Refresh the index to make the document searchable immediately
    await esClient.indices.refresh({ index: INDEX_NAME });
    
    console.log(`✅ University course ${course.id} indexed successfully`);
  } catch (error) {
    console.error(`❌ Error indexing university course ${course.id}:`, error);
    throw error;
  }
}

/**
 * Search university courses using Elasticsearch
 */
export async function searchUniversityCourses(query: string, options: {
  page?: number;
  limit?: number;
  filters?: {
    is_active?: boolean;
    university_id?: number;
  };
} = {}) {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;

    // Build the search query
    const mustQueries: any[] = [];
    const shouldQueries: any[] = [];

    // Text search query with partial word matching
    if (query && query.trim()) {
      const trimmedQuery = query.trim().toLowerCase();
      
      // For short queries (1-2 characters), prioritize prefix matching
      if (trimmedQuery.length <= 2) {
        shouldQueries.push(
          {
            prefix: {
              'name.keyword': {
                value: trimmedQuery,
                boost: 5.0 // Highest priority for prefix matches
              }
            }
          },
          {
            match_phrase_prefix: {
              name: {
                query: trimmedQuery,
                boost: 4.0
              }
            }
          }
        );
      }
      
      // Standard match queries
      shouldQueries.push(
        {
          match: {
            name: {
              query: query,
              fuzziness: trimmedQuery.length <= 3 ? 0 : 'AUTO',
              boost: 20
            }
          }
        },
        {
          match_phrase: {
            name: {
              query: query,
              boost: 100
            }
          }
        },
        {
          match_phrase_prefix: {
            name: {
              query: query,
              boost: 5
            }
          }
        },
        {
          match: {
            university_name: {
              query: query,
              fuzziness: trimmedQuery.length <= 3 ? 0 : 'AUTO',
              boost: 1.0
            }
          }
        }
      );
    }

    // Filters
    if (options.filters?.is_active !== undefined) {
      mustQueries.push({
        term: { is_active: options.filters.is_active }
      });
    }

    if (options.filters?.university_id !== undefined) {
      mustQueries.push({
        term: { university_id: options.filters.university_id }
      });
    }

    // Build the final query
    const searchQuery: any = {
      bool: {}
    };

    if (mustQueries.length > 0) {
      searchQuery.bool.must = mustQueries;
    }

    if (shouldQueries.length > 0) {
      searchQuery.bool.should = shouldQueries;
      searchQuery.bool.minimum_should_match = 1; // At least one should match
    }

    // If no query and no filters, return all
    if (mustQueries.length === 0 && shouldQueries.length === 0) {
      searchQuery.match_all = {};
    }

    // Execute search with _source filtering and highlighting
    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: searchQuery,
        from,
        size: limit,
        _source: [
          'id',
          'university_id',
          'name',
          'slug',
          'course_thumbnail',
          'duration',
          'is_active',
          'university_slug',
          'university_name',
          'h1Tag'
        ],
        highlight: {
          fields: {
            name: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            h1Tag: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            author_name: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            university_name: {
              fragment_size: 150,
              number_of_fragments: 1
            }
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        }
      }
    });

    // Extract results (v8 API - response structure is direct, not nested in body)
    const hits = response.hits.hits;

    // Return raw Elasticsearch format - array of hits with _index, _id, _score, _source, highlight
    // Map field names to match standard format
    return hits.map((hit: any) => ({
      _index: hit._index,
      _id: hit._id,
      _score: hit._score,
      _source: {
        id: hit._source.id,
        university_id: hit._source.university_id || null,
        name: hit._source.name,
        slug: hit._source.slug,
        thumbnail: hit._source.course_thumbnail || null,
        duration: hit._source.duration || null,
        type: 'university_course',
        status: hit._source.is_active ? 1 : 0,
        university_slug: hit._source.university_slug || null,
        course_slug: hit._source.slug || null,
        university_name: hit._source.university_name || null,
        h1Tag: hit._source.h1Tag || null
      },
      highlight: hit.highlight || {}
    }));
  } catch (error) {
    console.error('❌ Error searching university courses:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for university course names
 * Uses prefix matching on name field
 */
export async function getUniversityCourseSuggestions(query: string, limit: number = 10) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = query.trim().toLowerCase();

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            should: [
              {
                prefix: {
                  'name.keyword': {
                    value: searchQuery,
                    boost: 2.0 // Higher priority for exact prefix matches
                  }
                }
              },
              {
                match_phrase_prefix: {
                  name: {
                    query: searchQuery,
                    max_expansions: 50
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        size: limit,
        _source: ['id', 'university_id', 'name', 'slug', 'course_thumbnail'],
        sort: [
          { _score: { order: 'desc' } },
          { 'name.keyword': { order: 'asc' } }
        ]
      }
    });

    const hits = response.hits.hits;
    
    return hits.map((hit: any) => ({
      text: hit._source.name,
      score: hit._score,
      _id: hit._id,
      _source: {
        id: hit._source.id,
        university_id: hit._source.university_id || null,
        name: hit._source.name,
        slug: hit._source.slug,
        thumbnail: hit._source.course_thumbnail || null
      }
    }));
  } catch (error) {
    console.error('❌ Error getting suggestions:', error);
    throw error;
  }
}

/**
 * Get "Did You Mean" spell correction suggestions
 */
export async function getUniversityCourseSpellSuggestions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        suggest: {
          text: query.trim(),
          university_course_spell: {
            term: {
              field: 'name',
              suggest_mode: 'popular', // Only suggest popular terms
              min_word_length: 3
            }
          }
        },
        size: 0 // Don't return actual results, just suggestions
      }
    });

    const spellResult = response.suggest?.university_course_spell?.[0];
    const options = (spellResult?.options as any[]) || [];
    
    if (Array.isArray(options) && options.length > 0) {
      return {
        original: query,
        suggested: options[0].text,
        score: options[0].score
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting spell suggestions:', error);
    throw error;
  }
}

/**
 * Delete a university course from the index
 */
export async function deleteUniversityCourseFromIndex(courseId: number) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: courseId.toString()
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ University course ${courseId} deleted from index`);
  } catch (error: any) {
    // Ignore if document doesn't exist
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ University course ${courseId} not found in index`);
    } else {
      console.error(`❌ Error deleting university course ${courseId} from index:`, error);
      throw error;
    }
  }
}

