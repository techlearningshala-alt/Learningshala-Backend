/**
 * Script to manually create the courses index in Elasticsearch
 * Run this if you get "index_not_found_exception" error
 * 
 * Usage: npx ts-node src/scripts/create-course-index.ts
 */

import { createCourseIndex } from '../services/elasticsearch/course.search.service';

async function main() {
  try {
    console.log('🔄 Creating courses index...');
    await createCourseIndex();
    console.log('✅ Index created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating index:', error.message);
    process.exit(1);
  }
}

main();

