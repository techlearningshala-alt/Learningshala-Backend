-- Migration: Create specialization_banners table
-- Description: Stores banner/video assets attached to specializations
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `specialization_banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `specialization_id` INT NOT NULL,
  `banner_image` VARCHAR(255) DEFAULT NULL COMMENT 'Path to banner image',
  `video_id` VARCHAR(255) DEFAULT NULL COMMENT 'YouTube or video platform ID',
  `video_title` VARCHAR(255) DEFAULT NULL COMMENT 'Title of the video',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_specialization_id` (`specialization_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_specialization_banner_specialization`
    FOREIGN KEY (`specialization_id`)
    REFERENCES `specializations` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Banner and video assets linked to specializations';

