-- Migration: Create placement_partners table (WITHOUT FOREIGN KEY)
-- Description: Stores placement partner companies for each university
-- Use this if the foreign key constraint keeps failing
-- Author: CMS Admin
-- Date: 2025-01-30

CREATE TABLE IF NOT EXISTS `placement_partners` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT UNSIGNED NOT NULL,
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Path to uploaded logo image',
  `name` VARCHAR(255) DEFAULT '' COMMENT 'Company/Partner name',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX `idx_university_id` (`university_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores placement partner companies associated with universities';

