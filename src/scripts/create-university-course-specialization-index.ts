/**
 * Script to manually create the university course specializations index in Elasticsearch
 * Run this if you get "index_not_found_exception" error
 * 
 * Usage: npx ts-node src/scripts/create-university-course-specialization-index.ts
 */

import { createUniversityCourseSpecializationIndex } from '../services/elasticsearch/university-course-specialization.search.service';

async function main() {
  try {
    console.log('🔄 Creating university course specializations index...');
    await createUniversityCourseSpecializationIndex();
    console.log('✅ Index created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating index:', error.message);
    process.exit(1);
  }
}

main();

