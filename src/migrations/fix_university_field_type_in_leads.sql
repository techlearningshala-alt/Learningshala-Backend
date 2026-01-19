-- Migration: Fix university field type in leads table
-- Description: Ensures university field is VARCHAR and not ENUM to allow any university name
-- Author: CMS Admin
-- Date: 2025-01-XX

-- Check if column exists and modify it to VARCHAR(255) if it's ENUM
-- This will convert ENUM to VARCHAR if it exists as ENUM
ALTER TABLE `leads`
  MODIFY COLUMN `university` VARCHAR(255) DEFAULT NULL COMMENT 'University name';
