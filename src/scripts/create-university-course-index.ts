/**
 * Script to manually create the university courses index in Elasticsearch
 * Run this if you get "index_not_found_exception" error
 * 
 * Usage: npx ts-node src/scripts/create-university-course-index.ts
 */

import { createUniversityCourseIndex } from '../services/elasticsearch/university-course.search.service';

async function main() {
  try {
    console.log('🔄 Creating university courses index...');
    await createUniversityCourseIndex();
    console.log('✅ Index created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating index:', error.message);
    process.exit(1);
  }
}

main();

