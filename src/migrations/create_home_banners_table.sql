-- Migration: Create home_banners table
-- Description: Stores home page banners with image, video, and URL
-- Author: CMS Admin
-- Date: 2025-02-08

CREATE TABLE IF NOT EXISTS `home_banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `banner_image` VARCHAR(255) DEFAULT NULL COMMENT 'Path to uploaded banner image',
  `video_id` VARCHAR(255) DEFAULT NULL COMMENT 'Video ID (e.g., YouTube video ID)',
  `video_title` VARCHAR(255) DEFAULT NULL COMMENT 'Video title',
  `url` VARCHAR(500) DEFAULT NULL COMMENT 'URL link for the banner',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Home page banners with image, video, and URL';
