-- Migration: Create specialization_images table
-- Description: Stores specialization images with name and image path
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `specialization_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Image name/title',
  `image` VARCHAR(500) NOT NULL COMMENT 'Image file path',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

