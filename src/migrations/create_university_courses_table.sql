-- Migration: Create university_courses table
-- Description: Stores course offerings for each university with optional specialization linkage
-- Author: CMS Admin
-- Date: 2025-11-12

CREATE TABLE IF NOT EXISTS `university_courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `university_id` INT UNSIGNED NOT NULL,
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
  UNIQUE KEY `uniq_university_courses_slug` (`university_id`, `slug`),
  KEY `idx_university_courses_university_id` (`university_id`),
  CONSTRAINT `fk_university_courses_university`
    FOREIGN KEY (`university_id`)
    REFERENCES `universities` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Courses offered by universities';


