import esClient from '../../config/elasticsearch';

// Index name for courses
const INDEX_NAME = 'courses';

/**
 * Elasticsearch Service for Courses
 * This service handles all Elasticsearch operations for courses
 */

/**
 * Create the courses index with mapping
 * This defines the structure of documents in Elasticsearch
 */
export async function createCourseIndex() {
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
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' } // For exact matches and prefix queries
            }
          },
          slug: { type: 'keyword' },
          thumbnail: { type: 'keyword' },
          description: { type: 'text' },
          course_duration: { type: 'text' },
          upload_brochure: { type: 'keyword' },
          author_name: { type: 'text' },
          learning_mode: { type: 'text' },
          domain_id: { type: 'integer' },
          h1Tag: { type: 'text' },
          label: { type: 'text' },
          is_active: { type: 'boolean' },
          priority: { type: 'integer' },
          menu_visibility: { type: 'boolean' },
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
 * Index a course document (add or update)
 */
export async function indexCourse(course: any) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: course.id.toString(), // Use course ID as document ID
      body: {
        id: course.id,
        name: course.name,
        slug: course.slug,
        thumbnail: course.thumbnail || null,
        description: course.description || null,
        course_duration: course.course_duration || null,
        upload_brochure: course.upload_brochure || null,
        author_name: course.author_name || null,
        learning_mode: course.learning_mode || null,
        domain_id: course.domain_id || null,
        h1Tag: course.h1Tag || null,
        label: course.label || null,
        is_active: Boolean(course.is_active),
        priority: course.priority || 0,
        menu_visibility: Boolean(course.menu_visibility),
        created_at: course.created_at,
        updated_at: course.updated_at || new Date()
      }
    });

    // Refresh the index to make the document searchable immediately
    await esClient.indices.refresh({ index: INDEX_NAME });
    
    console.log(`✅ Course ${course.id} indexed successfully`);
  } catch (error) {
    console.error(`❌ Error indexing course ${course.id}:`, error);
    throw error;
  }
}

/**
 * Search courses using Elasticsearch
 */
export async function searchCourses(query: string, options: {
  page?: number;
  limit?: number;
  filters?: {
    is_active?: boolean;
    domain_id?: number;
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
              fuzziness: trimmedQuery.length <= 3 ? 0 : 'AUTO', // No fuzziness for short words like BBA/MBA
              boost: 20 // High priority for name matches
            }
          }
        },
        {
          match_phrase: {
            name: {
              query: query,
              boost: 100 // VERY high priority for main course name match
            }
          }
        }
      );

      // Only add partial matching for longer queries to avoid noise
      if (trimmedQuery.length > 2) {
        shouldQueries.push(
          {
            match_phrase_prefix: {
              name: {
                query: query,
                boost: 2.5 // Partial word matching
              }
            }
          },
          {
            wildcard: {
              'name.keyword': {
                value: `*${trimmedQuery}*`,
                boost: 0.5 // Lowered boost for contains matching
              }
            }
          }
        );
      }
      
      shouldQueries.push(
        {
          match: {
            description: {
              query: query,
              fuzziness: 'AUTO',
              boost: 2
            }
          }
        },
        {
          match: {
            author_name: {
              query: query,
              fuzziness: 'AUTO',
              boost: 1
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

    if (options.filters?.domain_id !== undefined) {
      mustQueries.push({
        term: { domain_id: options.filters.domain_id }
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
      searchQuery.bool.minimum_should_match = 1;
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
          'name',
          'slug',
          'thumbnail',
          'description',
          'course_duration',
          'is_active',
          'domain_id'
        ],
        highlight: {
          fields: {
            name: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            description: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            author_name: {
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
        name: hit._source.name,
        slug: hit._source.slug,
        thumbnail: hit._source.thumbnail || null,
        description: hit._source.description || null,
        course_duration: hit._source.course_duration || null,
        type: 'course',
        status: hit._source.is_active ? 1 : 0,
        domain_id: hit._source.domain_id || null,
        university_slug: null,
        course_slug: null
      },
      highlight: hit.highlight || {}
    }));
  } catch (error) {
    console.error('❌ Error searching courses:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for course names
 * Uses prefix matching on name field
 */
export async function getCourseSuggestions(query: string, limit: number = 10) {
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
        _source: ['id', 'name', 'slug', 'thumbnail'],
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
        name: hit._source.name,
        slug: hit._source.slug,
        thumbnail: hit._source.thumbnail || null
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
export async function getCourseSpellSuggestions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        suggest: {
          text: query.trim(),
          course_spell: {
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

    const spellResult = response.suggest?.course_spell?.[0];
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
 * Delete a course from the index
 */
export async function deleteCourseFromIndex(courseId: number) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: courseId.toString()
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ Course ${courseId} deleted from index`);
  } catch (error: any) {
    // Ignore if document doesn't exist
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ Course ${courseId} not found in index`);
    } else {
      console.error(`❌ Error deleting course ${courseId} from index:`, error);
      throw error;
    }
  }
}

