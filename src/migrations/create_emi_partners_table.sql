-- Migration: Create emi_partners table
-- Description: Stores EMI/financing partners (banks, NBFCs) that offer EMI options
-- Author: CMS Admin
-- Date: 2025-01-30

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS `emi_partners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Logo path for the EMI partner',
  `name` VARCHAR(255) DEFAULT NULL COMMENT 'Name of the EMI partner',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='EMI/Financing partners for universities';

