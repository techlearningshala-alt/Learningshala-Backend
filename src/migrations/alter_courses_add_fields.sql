-- Migration: Add new fields to courses table
-- Description: Add course_duration, upload_brochure, and author_name fields to existing courses table
-- Author: CMS Admin
-- Date: 2025-01-XX

-- Add course_duration field
ALTER TABLE `courses`
  ADD COLUMN `course_duration` VARCHAR(255) DEFAULT NULL AFTER `description`;

-- Add upload_brochure field
ALTER TABLE `courses`
  ADD COLUMN `upload_brochure` VARCHAR(255) DEFAULT NULL AFTER `course_duration`;

-- Add author_name field
ALTER TABLE `courses`
  ADD COLUMN `author_name` VARCHAR(255) DEFAULT NULL AFTER `upload_brochure`;

