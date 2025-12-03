-- Migration: Create specialization_sections table
-- Description: Stores sections/content blocks for specializations
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `specialization_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `specialization_id` INT NOT NULL,
  `section_key` VARCHAR(255) NOT NULL COMMENT 'Unique key identifier for the section',
  `title` VARCHAR(255) NOT NULL COMMENT 'Section title',
  `description` TEXT DEFAULT NULL COMMENT 'Section description/content',
  `image` VARCHAR(255) DEFAULT NULL COMMENT 'Optional image for sections like Admission Process',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_specialization_section_key` (`specialization_id`, `section_key`),
  INDEX `idx_specialization_id` (`specialization_id`),
  INDEX `idx_section_key` (`section_key`),
  CONSTRAINT `fk_specialization_section_specialization`
    FOREIGN KEY (`specialization_id`)
    REFERENCES `specializations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Content sections/blocks for specializations';

