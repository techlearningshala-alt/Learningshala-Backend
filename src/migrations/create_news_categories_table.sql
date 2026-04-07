-- Migration: Create news_categories table
-- Description: Mirrors blog_categories for News CMS content

CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT 'Category title',
  `category_slug` VARCHAR(255) NOT NULL COMMENT 'URL-friendly slug for the category',
  `category_visibility` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether category is visible',
  `category_summary` TEXT DEFAULT NULL COMMENT 'Category summary (CK Editor)',
  `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'Meta title for SEO',
  `meta_description` TEXT DEFAULT NULL COMMENT 'Meta description for SEO',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_news_category_slug` (`category_slug`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News categories';
