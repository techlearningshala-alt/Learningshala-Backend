/**
 * Script to manually create the specializations index in Elasticsearch
 * Run this if you get "index_not_found_exception" error
 * 
 * Usage: npx ts-node src/scripts/create-specialization-index.ts
 */

import { createSpecializationIndex } from '../services/elasticsearch/specialization.search.service';

async function main() {
  try {
    console.log('🔄 Creating specializations index...');
    await createSpecializationIndex();
    console.log('✅ Index created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating index:', error.message);
    process.exit(1);
  }
}

main();

