-- Migration: Remove unique constraint on slug from university_course_specialization table
-- Description: Allow duplicate slugs for specializations (they can be same across different courses)
-- Author: CMS Admin
-- Date: 2025-01-XX

-- Drop the unique constraint on (university_course_id, slug)
ALTER TABLE `university_course_specialization`
DROP INDEX `uniq_uc_specialization_course_slug`;
