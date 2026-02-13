-- Migration: Create redirections table
-- Description: Stores URL redirection mappings (old_url -> new_url)
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `redirections` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `old_url` VARCHAR(500) NOT NULL COMMENT 'Original URL that needs to be redirected',
  `new_url` VARCHAR(500) NOT NULL COMMENT 'Target URL to redirect to',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_old_url` (`old_url`),
  INDEX `idx_old_url` (`old_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='URL redirection mappings';
