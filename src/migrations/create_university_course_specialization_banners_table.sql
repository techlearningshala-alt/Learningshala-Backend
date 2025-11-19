-- Migration: Create university_course_specialization_banners table
-- Description: Stores banner/video assets for university course specializations
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `university_course_specialization_banners` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `specialization_id` INT UNSIGNED NOT NULL,
  `banner_key` VARCHAR(255) NOT NULL,
  `banner_image` VARCHAR(255) DEFAULT NULL,
  `video_id` VARCHAR(255) DEFAULT NULL,
  `video_title` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_specialization_banner_key` (`specialization_id`, `banner_key`),
  KEY `idx_specialization_banners_specialization_id` (`specialization_id`),
  CONSTRAINT `fk_specialization_banners_specialization`
    FOREIGN KEY (`specialization_id`)
    REFERENCES `university_course_specialization` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Banners for university course specializations';

