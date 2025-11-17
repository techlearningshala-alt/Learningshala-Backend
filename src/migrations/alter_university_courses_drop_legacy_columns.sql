-- Migration: Remove legacy fields from university_courses and enhance course banners
-- Description:
--   - Drops obsolete course-level banner and fee columns now handled elsewhere
--   - Adds banner_image column to university_course_banners for storing banner asset path
-- Author: CMS Admin
-- Date: 2025-11-13

ALTER TABLE `university_courses`
  DROP COLUMN `full_fees`,
  DROP COLUMN `sem_fees`,
  DROP COLUMN `course_banner`;

ALTER TABLE `university_course_banners`
  ADD COLUMN `banner_image` VARCHAR(255) DEFAULT NULL AFTER `banner_key`;
