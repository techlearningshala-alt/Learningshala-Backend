-- Migration: Create news table
-- Description: Mirrors blogs for News CMS content

CREATE TABLE IF NOT EXISTS `news` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL COMMENT 'Foreign key to news_categories.id',
  `h1_tag` VARCHAR(255) DEFAULT NULL COMMENT 'H1 heading tag for SEO',
  `slug` VARCHAR(255) DEFAULT NULL COMMENT 'URL-friendly slug',
  `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'Meta title for SEO',
  `meta_description` TEXT DEFAULT NULL COMMENT 'Meta description for SEO',
  `author_id` INT UNSIGNED DEFAULT NULL COMMENT 'Foreign key to authors.id',
  `title` VARCHAR(255) NOT NULL COMMENT 'News title',
  `short_description` TEXT DEFAULT NULL COMMENT 'Short description/summary',
  `author_name` VARCHAR(255) DEFAULT NULL COMMENT 'Author name (legacy)',
  `author_details` TEXT DEFAULT NULL COMMENT 'Author details (legacy)',
  `author_image` VARCHAR(255) DEFAULT NULL COMMENT 'Author image path (legacy)',
  `thumbnail` VARCHAR(255) DEFAULT NULL COMMENT 'Thumbnail image path',
  `verified` TINYINT(1) DEFAULT 0 COMMENT 'Whether verified',
  `update_date` DATE DEFAULT NULL COMMENT 'Update date',
  `content` LONGTEXT DEFAULT NULL COMMENT 'News content (HTML)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_author_id` (`author_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_update_date` (`update_date`),
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='News articles';
