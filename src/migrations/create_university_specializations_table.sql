-- Migration: Create university_course_specializations table
-- Description: Stores specialization offerings for each university course
-- Author: CMS Admin
-- Date: 2025-11-12

CREATE TABLE IF NOT EXISTS `university_course_specializations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `university_course_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `full_fees` DECIMAL(12,2) DEFAULT NULL,
  `sem_fees` DECIMAL(12,2) DEFAULT NULL,
  `duration` VARCHAR(255) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `label` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_uc_specializations_course_slug` (`university_course_id`, `slug`),
  KEY `idx_uc_specializations_course_id` (`university_course_id`),
  CONSTRAINT `fk_uc_specializations_course`
    FOREIGN KEY (`university_course_id`)
    REFERENCES `university_courses` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Specializations offered per university course';


