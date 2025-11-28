-- Migration: Add image column to course_sections
-- Description: Allows storing optional media for specific sections (e.g., Admission Process)
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `course_sections`
  ADD COLUMN `image` VARCHAR(255) DEFAULT NULL AFTER `description`;

