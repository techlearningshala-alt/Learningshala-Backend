-- Migration: Create course_sections table
-- Description: Stores sections/content blocks for courses
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `course_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `section_key` VARCHAR(255) NOT NULL COMMENT 'Unique key identifier for the section',
  `title` VARCHAR(255) NOT NULL COMMENT 'Section title',
  `description` TEXT DEFAULT NULL COMMENT 'Section description/content',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_section_key` (`section_key`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_course_section_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `courses` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Content sections/blocks for courses';

