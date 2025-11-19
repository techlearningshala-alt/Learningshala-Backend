-- Migration: Create university_course_specialization_sections table
-- Description: Stores sections for university course specializations
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `university_course_specialization_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `specialization_id` INT UNSIGNED NOT NULL,
  `section_key` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `component` VARCHAR(255) NOT NULL,
  `props` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_specialization_section` (`specialization_id`, `section_key`),
  KEY `idx_specialization_sections_specialization_id` (`specialization_id`),
  CONSTRAINT `fk_specialization_sections_specialization`
    FOREIGN KEY (`specialization_id`)
    REFERENCES `university_course_specialization` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sections for university course specializations';

