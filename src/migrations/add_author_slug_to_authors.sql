-- Migration: Add author_slug to authors table
-- Description: Stores URL-friendly slug for author pages/SEO
-- Author: CMS Admin
-- Date: 2026-03-23

ALTER TABLE `authors`
  ADD COLUMN `author_slug` VARCHAR(255) DEFAULT NULL COMMENT 'URL-friendly slug for author' AFTER `label`;

CREATE INDEX `idx_author_slug` ON `authors` (`author_slug`);

