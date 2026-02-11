-- Migration: Add emi_facility column to courses table
-- Description: Indicates whether EMI facility is available for the course (Yes/No)
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `courses`
ADD COLUMN `emi_facility` TINYINT(1) DEFAULT 0 COMMENT 'EMI facility available (1=yes, 0=no)' AFTER `podcast_embed`;

