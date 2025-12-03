-- Migration: Add new fields to leads table
-- Description: Adds currently_employed and university_for_placement_salaryhike_promotions fields
-- Author: CMS Admin
-- Date: 2025-01-XX

-- Add currently_employed column
ALTER TABLE `leads`
  ADD COLUMN `currently_employed` VARCHAR(10) DEFAULT NULL COMMENT 'Yes/No value indicating if lead is currently employed'
  AFTER `experience`;

-- Add university_for_placement_salaryhike_promotions column
ALTER TABLE `leads`
  ADD COLUMN `university_for_placement_salaryhike_promotions` VARCHAR(255) DEFAULT NULL COMMENT 'University name for placement, salary hike, or promotions'
  AFTER `currently_employed`;

