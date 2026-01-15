-- Migration: Create blogs table
-- Description: Stores blog posts with category, content, and author information
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to blog_categories.id',
  `title` VARCHAR(255) NOT NULL COMMENT 'Blog post title',
  `short_description` TEXT DEFAULT NULL COMMENT 'Short description/summary of the blog',
  `author_name` VARCHAR(255) DEFAULT NULL COMMENT 'Author name',
  `author_details` TEXT DEFAULT NULL COMMENT 'Author details/bio',
  `author_image` VARCHAR(255) DEFAULT NULL COMMENT 'Author image path',
  `thumbnail` VARCHAR(255) DEFAULT NULL COMMENT 'Blog thumbnail image path',
  `verified` TINYINT(1) DEFAULT 0 COMMENT 'Whether the author is verified (0 or 1)',
  `update_date` DATE DEFAULT NULL COMMENT 'Update date for the blog post',
  `content` LONGTEXT DEFAULT NULL COMMENT 'Blog content (HTML from CKEditor)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_update_date` (`update_date`),
  FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Blog posts with category, content, and author information';
