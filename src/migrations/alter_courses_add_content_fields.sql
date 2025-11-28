-- Migration: Add additional content fields to courses table
-- Description: Adds h1Tag, label, and podcast embed columns
-- Author: CMS Admin
-- Date: 2025-01-XX
-- Note: Run alter_courses_add_fields.sql first to ensure author_name exists
-- If you get "Duplicate column name" errors, the columns already exist and you can ignore them

-- Add h1Tag column
ALTER TABLE `courses`
  ADD COLUMN `h1Tag` VARCHAR(255) DEFAULT NULL AFTER `slug`;

-- Add label column  
ALTER TABLE `courses`
  ADD COLUMN `label` VARCHAR(255) DEFAULT NULL AFTER `h1Tag`;

-- Add podcast_embed column
ALTER TABLE `courses`
  ADD COLUMN `podcast_embed` TEXT DEFAULT NULL AFTER `author_name`;

