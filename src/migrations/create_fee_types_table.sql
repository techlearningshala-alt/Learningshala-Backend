-- Migration: Create fee_types table
-- Description: Stores fee types that can be assigned to courses or other entities
-- Author: CMS Admin
-- Date: 2025-11-12

CREATE TABLE IF NOT EXISTS `fee_types` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `fee_key` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_fee_types_title` (`title`),
  UNIQUE KEY `uniq_fee_types_key` (`fee_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Master list of fee types';



