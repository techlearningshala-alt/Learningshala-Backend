import esClient from '../../config/elasticsearch';

// Index name for specializations
const INDEX_NAME = 'specializations';

/**
 * Elasticsearch Service for Specializations
 * This service handles all Elasticsearch operations for specializations
 */

/**
 * Create the specializations index with mapping
 */
export async function createSpecializationIndex() {
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
          course_id: { type: 'integer' },
          course_slug: { type: 'keyword' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          slug: { type: 'keyword' },
          thumbnail: { type: 'keyword' },
          h1Tag: { type: 'text' },
          label: { type: 'text' },
          description: { type: 'text' },
          course_duration: { type: 'text' },
          upload_brochure: { type: 'keyword' },
          author_name: { type: 'text' },
          learning_mode: { type: 'text' },
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
 * Index a specialization document (add or update)
 */
export async function indexSpecialization(specialization: any) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: specialization.id.toString(),
      body: {
        id: specialization.id,
        course_id: specialization.course_id || null,
        course_slug: specialization.course_slug || null,
        name: specialization.name,
        slug: specialization.slug,
        thumbnail: specialization.thumbnail || null,
        h1Tag: specialization.h1Tag || null,
        label: specialization.label || null,
        description: specialization.description || null,
        course_duration: specialization.course_duration || null,
        upload_brochure: specialization.upload_brochure || null,
        author_name: specialization.author_name || null,
        learning_mode: specialization.learning_mode || null,
        is_active: Boolean(specialization.is_active),
        priority: specialization.priority || 0,
        menu_visibility: Boolean(specialization.menu_visibility),
        created_at: specialization.created_at,
        updated_at: specialization.updated_at || new Date()
      }
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ Specialization ${specialization.id} indexed successfully`);
  } catch (error) {
    console.error(`❌ Error indexing specialization ${specialization.id}:`, error);
    throw error;
  }
}

/**
 * Search specializations using Elasticsearch
 */
export async function searchSpecializations(query: string, options: {
  page?: number;
  limit?: number;
  filters?: {
    is_active?: boolean;
    course_id?: number;
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
      // Higher boost for longer queries to prioritize exact phrase matches
      const phraseBoost = trimmedQuery.length > 5 ? 200 : 100;
      
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
              boost: phraseBoost // Higher boost for longer exact phrase matches
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
        }
      );
    }

    if (options.filters?.is_active !== undefined) {
      mustQueries.push({
        term: { is_active: options.filters.is_active }
      });
    }

    if (options.filters?.course_id !== undefined) {
      mustQueries.push({
        term: { course_id: options.filters.course_id }
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
          'course_id',
          'course_slug',
          'name',
          'slug',
          'thumbnail',
          'course_duration',
          'is_active'
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
        },
        sort: [
          { _score: { order: 'desc' } },
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
        course_id: hit._source.course_id || null,
        name: hit._source.name,
        slug: hit._source.slug,
        thumbnail: hit._source.thumbnail || null,
        course_duration: hit._source.course_duration || null,
        type: 'specialization',
        status: hit._source.is_active ? 1 : 0,
        university_slug: null,
        course_slug: hit._source.course_slug || null
      },
      highlight: hit.highlight || {}
    }));
  } catch (error) {
    console.error('❌ Error searching specializations:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for specialization names
 */
export async function getSpecializationSuggestions(query: string, limit: number = 10) {
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
        _source: ['id', 'course_id', 'name', 'slug', 'thumbnail'],
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
        course_id: hit._source.course_id || null,
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
export async function getSpecializationSpellSuggestions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        suggest: {
          text: query.trim(),
          specialization_spell: {
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

    const spellResult = response.suggest?.specialization_spell?.[0];
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
 * Delete a specialization from the index
 */
export async function deleteSpecializationFromIndex(specializationId: number) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: specializationId.toString()
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ Specialization ${specializationId} deleted from index`);
  } catch (error: any) {
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ Specialization ${specializationId} not found in index`);
    } else {
      console.error(`❌ Error deleting specialization ${specializationId} from index:`, error);
      throw error;
    }
  }
}

