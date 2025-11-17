-- Migration: Update university_courses schema and add course banners
-- Description:
--   - Rename asset columns to course_banner / course_thumbnail
--   - Add author_name, is_active, syllabus_file fields
--   - Create university_course_banners table with stable banner_key
-- Author: CMS Admin
-- Date: 2025-11-13

ALTER TABLE `university_courses`
  CHANGE COLUMN `image` `course_banner` VARCHAR(255) DEFAULT NULL,
  CHANGE COLUMN `icon` `course_thumbnail` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `author_name` VARCHAR(255) DEFAULT NULL AFTER `label`,
  ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `author_name`,
  ADD COLUMN `syllabus_file` VARCHAR(255) DEFAULT NULL AFTER `is_active`,
  ADD COLUMN `fee_type_values` JSON DEFAULT NULL AFTER `syllabus_file`;

CREATE TABLE IF NOT EXISTS `university_course_banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` INT UNSIGNED NOT NULL,
  `banner_key` VARCHAR(255) NOT NULL,
  `brochure_file` VARCHAR(255) DEFAULT NULL,
  `video_id` VARCHAR(255) DEFAULT NULL,
  `video_title` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_course_banner_key` (`course_id`, `banner_key`),
  CONSTRAINT `fk_course_banner_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `university_courses` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Banner and brochure assets linked to individual university courses';


