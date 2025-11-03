-- Migration: Remove university_id from placement_partners table
-- Description: Partners are now managed globally and associated with universities via university.placement_partner_ids
-- Author: CMS Admin
-- Date: 2025-01-30

-- Remove foreign key constraint first
ALTER TABLE `placement_partners` 
DROP FOREIGN KEY `fk_placement_partners_university`;

-- Remove the index
ALTER TABLE `placement_partners` 
DROP INDEX `idx_university_id`;

-- Remove the column
ALTER TABLE `placement_partners` 
DROP COLUMN `university_id`;

