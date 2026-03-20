-- Migration: Add blog category summary and meta fields
-- Description: Adds fields used for CK Editor summary and SEO meta tags
-- Author: CMS Admin
-- Date: 2026-03-20

ALTER TABLE `blog_categories`
  ADD COLUMN `category_summary` TEXT DEFAULT NULL COMMENT 'Category summary (CK Editor)' AFTER `category_visibility`,
  ADD COLUMN `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'Meta title for SEO' AFTER `category_summary`,
  ADD COLUMN `meta_description` TEXT DEFAULT NULL COMMENT 'Meta description for SEO' AFTER `meta_title`;

