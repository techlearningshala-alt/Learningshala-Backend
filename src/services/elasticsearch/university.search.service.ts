import esClient from '../../config/elasticsearch';

// Index name for universities
const INDEX_NAME = 'universities';

/**
 * Elasticsearch Service for Universities
 * This service handles all Elasticsearch operations for universities
 */

/**
 * Create the universities index with mapping
 * This defines the structure of documents in Elasticsearch
 */
export async function createUniversityIndex() {
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
          university_name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' } // For exact matches and prefix queries
            }
          },
          university_slug: { type: 'keyword' },
          university_logo: { type: 'keyword' },
          university_location: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          university_brochure: { type: 'keyword' },
          author_name: { type: 'text' },
          is_active: { type: 'boolean' },
          approval_id: { type: 'integer' },
          placement_partner_ids: { type: 'text' },
          emi_partner_ids: { type: 'text' },
          created_at: { type: 'date' },
          updated_at: { type: 'date' },
          // Store banners and sections for search
          banners: { type: 'nested' },
          sections: { type: 'nested' }
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
 * Index a university document (add or update)
 */
export async function indexUniversity(university: any) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: university.id.toString(), // Use university ID as document ID
      body: {
        id: university.id,
        university_name: university.university_name,
        university_slug: university.university_slug,
        university_logo: university.university_logo || null,
        university_location: university.university_location || null,
        university_brochure: university.university_brochure || null,
        author_name: university.author_name || null,
        is_active: Boolean(university.is_active),
        approval_id: university.approval_id || null,
        placement_partner_ids: university.placement_partner_ids || null,
        emi_partner_ids: university.emi_partner_ids || null,
        created_at: university.created_at,
        updated_at: university.updated_at || new Date(),
        banners: university.banners || [],
        sections: university.sections || []
      }
    });

    // Refresh the index to make the document searchable immediately
    await esClient.indices.refresh({ index: INDEX_NAME });
    
    console.log(`✅ University ${university.id} indexed successfully`);
  } catch (error) {
    console.error(`❌ Error indexing university ${university.id}:`, error);
    throw error;
  }
}

/**
 * Search universities using Elasticsearch
 */
export async function searchUniversities(query: string, options: {
  page?: number;
  limit?: number;
  filters?: {
    is_active?: boolean;
    approval_id?: number;
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
              'university_name.keyword': {
                value: trimmedQuery,
                boost: 5.0 // Highest priority for prefix matches
              }
            }
          },
          {
            match_phrase_prefix: {
              university_name: {
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
            university_name: {
              query: query,
              fuzziness: 'AUTO', // Allows typos (auto determines fuzziness)
              boost: 3 // Higher priority for name matches
            }
          }
        },
        {
          match_phrase_prefix: {
            university_name: {
              query: query,
              boost: 2.5 // Partial word matching
            }
          }
        },
        {
          wildcard: {
            'university_name.keyword': {
              value: `*${trimmedQuery}*`,
              boost: 2.0 // Contains matching
            }
          }
        },
        {
          match: {
            university_location: {
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

    if (options.filters?.approval_id !== undefined) {
      mustQueries.push({
        term: { approval_id: options.filters.approval_id }
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
          'university_name',
          'university_slug',
          'university_logo',
          'university_location',
          'is_active'
        ],
        highlight: {
          fields: {
            university_name: {
              fragment_size: 150,
              number_of_fragments: 1
            },
            university_location: {
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
    // Map field names to match standard format (name, slug, logo, location, status)
    return hits.map((hit: any) => ({
      _index: hit._index,
      _id: hit._id,
      _score: hit._score,
      _source: {
        id: hit._source.id,
        name: hit._source.university_name,
        slug: hit._source.university_slug,
        logo: hit._source.university_logo || null,
        location: hit._source.university_location || null,
        type: 'university',
        status: hit._source.is_active ? 1 : 0,
        university_slug: hit._source.university_slug,
        course_slug: null
      },
      highlight: hit.highlight || {}
    }));
  } catch (error) {
    console.error('❌ Error searching universities:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for university names
 * Uses prefix matching on university_name field
 */
export async function getUniversitySuggestions(query: string, limit: number = 10) {
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
                  'university_name.keyword': {
                    value: searchQuery,
                    boost: 2.0 // Higher priority for exact prefix matches
                  }
                }
              },
              {
                match_phrase_prefix: {
                  university_name: {
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
        _source: ['id', 'university_name', 'university_slug', 'university_logo'],
        sort: [
          { _score: { order: 'desc' } },
          { 'university_name.keyword': { order: 'asc' } }
        ]
      }
    });

    const hits = response.hits.hits;
    
    return hits.map((hit: any) => ({
      text: hit._source.university_name,
      score: hit._score,
      _id: hit._id,
      _source: {
        id: hit._source.id,
        name: hit._source.university_name,
        slug: hit._source.university_slug,
        logo: hit._source.university_logo || null
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
export async function getSpellSuggestions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        suggest: {
          text: query.trim(),
          university_spell: {
            term: {
              field: 'university_name',
              suggest_mode: 'popular', // Only suggest popular terms
              min_word_length: 3
            }
          }
        },
        size: 0 // Don't return actual results, just suggestions
      }
    });

    const spellResult = response.suggest?.university_spell?.[0];
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
 * Delete a university from the index
 */
export async function deleteUniversityFromIndex(universityId: number) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: universityId.toString()
    });

    await esClient.indices.refresh({ index: INDEX_NAME });
    console.log(`✅ University ${universityId} deleted from index`);
  } catch (error: any) {
    // Ignore if document doesn't exist
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ University ${universityId} not found in index`);
    } else {
      console.error(`❌ Error deleting university ${universityId} from index:`, error);
      throw error;
    }
  }
}

