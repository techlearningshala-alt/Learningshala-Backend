-- Migration: Add banner_type column to home_banners table
-- Description: Adds banner_type column to differentiate between website and mobile banners
-- Author: CMS Admin
-- Date: 2025-02-08

ALTER TABLE `home_banners`
ADD COLUMN `banner_type` VARCHAR(50) DEFAULT 'website' COMMENT 'Type of banner: website or mobile' AFTER `url`;

-- Update existing records to have 'website' type
UPDATE `home_banners` SET `banner_type` = 'website' WHERE `banner_type` IS NULL;

-- Add index for faster queries by banner_type
CREATE INDEX `idx_banner_type` ON `home_banners` (`banner_type`);
