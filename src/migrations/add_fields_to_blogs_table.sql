-- Migration: Add new fields to blogs table
-- Description: Adds h1_tag, slug, meta_title, meta_description, and changes author_name to author_id
-- Author: CMS Admin
-- Date: 2025-02-08

-- Add new fields
ALTER TABLE `blogs`
  ADD COLUMN `h1_tag` VARCHAR(255) DEFAULT NULL COMMENT 'H1 heading tag for SEO' AFTER `category_id`,
  ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL COMMENT 'URL-friendly slug' AFTER `h1_tag`,
  ADD COLUMN `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'Meta title for SEO' AFTER `slug`,
  ADD COLUMN `meta_description` TEXT DEFAULT NULL COMMENT 'Meta description for SEO' AFTER `meta_title`,
  ADD COLUMN `author_id` INT UNSIGNED DEFAULT NULL COMMENT 'Foreign key to authors.id' AFTER `meta_description`;

-- Add index for slug (for URL lookups)
ALTER TABLE `blogs`
  ADD INDEX `idx_slug` (`slug`);

-- Add index for author_id
ALTER TABLE `blogs`
  ADD INDEX `idx_author_id` (`author_id`);

-- Add foreign key constraint for author_id (if authors table exists)
-- Note: This will fail if authors table doesn't exist yet
ALTER TABLE `blogs`
  ADD CONSTRAINT `fk_blogs_author` 
    FOREIGN KEY (`author_id`) 
    REFERENCES `authors` (`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Note: author_name, author_details, and author_image columns are kept for backward compatibility
-- but will be deprecated in favor of author_id relationship
