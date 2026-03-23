-- Migration: Add meta fields to authors
-- Description: Adds SEO meta fields for author pages
-- Author: CMS Admin
-- Date: 2026-03-23

ALTER TABLE `authors`
  ADD COLUMN `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'Meta title for SEO' AFTER `author_slug`,
  ADD COLUMN `meta_description` TEXT DEFAULT NULL COMMENT 'Meta description for SEO' AFTER `meta_title`;

