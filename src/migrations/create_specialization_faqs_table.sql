-- Migration: Create specialization_faqs table
-- Description: Creates table for specialization FAQs using shared course_faq_categories
-- Author: CMS Admin
-- Date: 2025-01-XX

-- Create specialization_faqs table (matching course_faqs structure)
CREATE TABLE IF NOT EXISTS `specialization_faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `specialization_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `course_faq_categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`specialization_id`) REFERENCES `specializations`(`id`) ON DELETE CASCADE,
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_specialization_id` (`specialization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

