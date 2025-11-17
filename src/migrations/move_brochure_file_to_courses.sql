-- Migration: Move brochure_file from university_course_banners to university_courses
-- Description: Brochure file will be at course level, not per banner
-- Author: CMS Admin
-- Date: 2025-01-14

-- Add brochure_file column to university_courses table
ALTER TABLE `university_courses`
  ADD COLUMN `brochure_file` VARCHAR(255) DEFAULT NULL AFTER `syllabus_file`;

-- Remove brochure_file column from university_course_banners table
ALTER TABLE `university_course_banners`
  DROP COLUMN `brochure_file`;

