-- Migration: Add compare_page_slug to university course and specialization
-- Description: Adds compare page slug field for compare pages SEO URLs
-- Author: CMS Admin
-- Date: 2026-03-24

ALTER TABLE `university_courses`
  ADD COLUMN `compare_page_slug` VARCHAR(255) DEFAULT NULL COMMENT 'Compare page slug' AFTER `meta_description`;

ALTER TABLE `university_course_specialization`
  ADD COLUMN `compare_page_slug` VARCHAR(255) DEFAULT NULL COMMENT 'Compare page slug' AFTER `meta_description`;

