-- Migration: Create placement_partners table
-- Description: Stores placement partner companies for each university
-- Author: CMS Admin
-- Date: 2025-01-30

-- Step 1: Create table without foreign key first
CREATE TABLE IF NOT EXISTS `placement_partners` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `university_id` INT UNSIGNED NOT NULL,
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Path to uploaded logo image',
  `name` VARCHAR(255) DEFAULT '' COMMENT 'Company/Partner name',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Index for foreign key
  INDEX `idx_university_id` (`university_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add foreign key constraint (only if universities table exists)
-- Note: If you get an error, make sure universities.id is INT UNSIGNED
ALTER TABLE `placement_partners`
  ADD CONSTRAINT `fk_placement_partners_university` 
    FOREIGN KEY (`university_id`) 
    REFERENCES `universities` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- Step 3: Add comment to table
ALTER TABLE `placement_partners` COMMENT = 'Stores placement partner companies associated with universities';

