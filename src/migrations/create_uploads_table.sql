-- Migration: Create uploads table
-- Description: Stores uploaded files (images and PDFs) with name and file path
-- Author: CMS Admin
-- Date: 2025-02-20

CREATE TABLE IF NOT EXISTS `uploads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) DEFAULT NULL COMMENT 'Optional display name',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'S3 key or file path',
  `file_type` ENUM('image', 'pdf') NOT NULL DEFAULT 'image' COMMENT 'Type of file',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
