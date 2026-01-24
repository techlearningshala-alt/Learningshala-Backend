-- Migration: Create authors table
-- Description: Stores author information with name, image, details, and label
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `authors` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `author_details` TEXT DEFAULT NULL,
  `label` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stores author information';
