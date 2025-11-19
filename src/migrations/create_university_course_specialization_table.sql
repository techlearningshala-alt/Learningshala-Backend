-- Migration: Create university_course_specialization table
-- Description: Stores specialization offerings for each university course with university_id and university_course_id
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `university_course_specialization` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `university_id` INT UNSIGNED NOT NULL,
  `university_course_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `duration` VARCHAR(255) DEFAULT NULL,
  `label` VARCHAR(255) DEFAULT NULL,
  `course_thumbnail` VARCHAR(255) DEFAULT NULL,
  `author_name` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `syllabus_file` VARCHAR(255) DEFAULT NULL,
  `brochure_file` VARCHAR(255) DEFAULT NULL,
  `fee_type_values` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_uc_specialization_course_slug` (`university_course_id`, `slug`),
  KEY `idx_uc_specialization_university_id` (`university_id`),
  KEY `idx_uc_specialization_course_id` (`university_course_id`),
  CONSTRAINT `fk_uc_specialization_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_uc_specialization_course`
    FOREIGN KEY (`university_course_id`)
    REFERENCES `university_courses` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Specializations offered per university course';

