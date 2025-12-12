/**
 * Script to manually create the universities index in Elasticsearch
 * Run this if you get "index_not_found_exception" error
 * 
 * Usage: npx ts-node src/scripts/create-university-index.ts
 */

import { createUniversityIndex } from '../services/elasticsearch/university.search.service';

async function main() {
  try {
    console.log('🔄 Creating universities index...');
    await createUniversityIndex();
    console.log('✅ Index created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating index:', error.message);
    process.exit(1);
  }
}

main();

