import esClient from '../../config/elasticsearch';

// Index name for university course specializations
const INDEX_NAME = 'university_course_specializations';

/**
 * Elasticsearch Service for University Course Specializations
 * This service handles all Elasticsearch operations for university course specializations
 */

/**
 * Create the university course specializations index with mapping
 */
export async function createUniversityCourseSpecializationIndex() {
  try {
    const exists = await esClient.indices.exists({ index: INDEX_NAME });
    
    if (exists) {
      console.log(`📦 Index "${INDEX_NAME}" already exists`);
      return;
    }

    await esClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          id: { type: 'integer' },
          university_course_id: { type: 'integer' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          slug: { type: 'keyword' },
          image: { type: 'keyword' },
          label: { type: 'text' },
          icon: { type: 'keyword' },
          full_fees: { type: 'float' },
          sem_fees: { type: 'float' },
          duration: { type: 'text' },
          is_page_created: { type: 'boolean' },
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
 * Index a university course specialization document (add or update)
 */
export async function indexUniversityCourseSpecialization(specialization: any) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: specialization.id.toString(),
      body: {
        id: specialization.id,
        university_course_id: specialization.university_course_id || null,
        name: specialization.name,
        slug: specialization.slug,
        image: specialization.image || null,
        label: specialization.label || null,
        icon: specialization.icon || null,
        full_fees: specialization.full_fees || null,
        sem_fees: specialization.sem_fees || null,
        duration: specialization.duration || null,
        is_page_created: Boolean(specialization.is_page_created),
        created_at: specialization.created_at,
        updated_at: specialization.updated_at || new Date()
      }
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ University course specialization ${specialization.id} indexed successfully`);
  } catch (error) {
    console.error(`❌ Error indexing university course specialization ${specialization.id}:`, error);
    throw error;
  }
}

/**
 * Search university course specializations using Elasticsearch
 */
export async function searchUniversityCourseSpecializations(query: string, options: {
  page?: number;
  limit?: number;
  filters?: {
    university_course_id?: number;
  };
} = {}) {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;

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
      
      // Standard match queries (works for full words and partial)
      shouldQueries.push(
        {
          match: {
            name: {
              query: query,
              fuzziness: 'AUTO',
              boost: 3
            }
          }
        },
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
              boost: 2.0 // Contains matching
            }
          }
        },
        {
          match: {
            label: {
              query: query,
              fuzziness: 'AUTO',
              boost: 2
            }
          }
        }
      );
    }

    if (options.filters?.university_course_id !== undefined) {
      mustQueries.push({
        term: { university_course_id: options.filters.university_course_id }
      });
    }

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

    if (mustQueries.length === 0 && shouldQueries.length === 0) {
      searchQuery.match_all = {};
    }

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: searchQuery,
        from,
        size: limit,
        _source: [
          'id',
          'university_course_id',
          'name',
          'slug',
          'image',
          'duration',
          'full_fees',
          'sem_fees'
        ],
        highlight: {
          fields: {
            name: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            label: {
              fragment_size: 150,
              number_of_fragments: 1
            }
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        },
        sort: [
          { created_at: { order: 'desc' } },
          { id: { order: 'desc' } }
        ]
      }
    });

    const hits = response.hits.hits;

    return hits.map((hit: any) => ({
      _index: hit._index,
      _id: hit._id,
      _score: hit._score,
      _source: {
        id: hit._source.id,
        university_course_id: hit._source.university_course_id || null,
        name: hit._source.name,
        slug: hit._source.slug,
        image: hit._source.image || null,
        duration: hit._source.duration || null,
        full_fees: hit._source.full_fees || null,
        sem_fees: hit._source.sem_fees || null
      },
      highlight: hit.highlight || {}
    }));
  } catch (error) {
    console.error('❌ Error searching university course specializations:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for university course specialization names
 */
export async function getUniversityCourseSpecializationSuggestions(query: string, limit: number = 10) {
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
                    boost: 2.0
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
        _source: ['id', 'university_course_id', 'name', 'slug', 'image'],
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
        university_course_id: hit._source.university_course_id || null,
        name: hit._source.name,
        slug: hit._source.slug,
        image: hit._source.image || null
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
export async function getUniversityCourseSpecializationSpellSuggestions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        suggest: {
          text: query.trim(),
          university_course_specialization_spell: {
            term: {
              field: 'name',
              suggest_mode: 'popular',
              min_word_length: 3
            }
          }
        },
        size: 0
      }
    });

    const spellResult = response.suggest?.university_course_specialization_spell?.[0];
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
 * Delete a university course specialization from the index
 */
export async function deleteUniversityCourseSpecializationFromIndex(specializationId: number) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: specializationId.toString()
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ University course specialization ${specializationId} deleted from index`);
  } catch (error: any) {
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ University course specialization ${specializationId} not found in index`);
    } else {
      console.error(`❌ Error deleting university course specialization ${specializationId} from index:`, error);
      throw error;
    }
  }
}

