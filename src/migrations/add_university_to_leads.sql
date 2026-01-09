-- Migration: Add university field to leads table
-- Description: Adds university column to store university name for leads
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `leads`
  ADD COLUMN `university` VARCHAR(255) DEFAULT NULL COMMENT 'University name'
  AFTER `course`;

-- Add index for better query performance
ALTER TABLE `leads`
  ADD INDEX `idx_university` (`university`);

