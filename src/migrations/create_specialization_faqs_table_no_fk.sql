-- Migration: Create specialization_faqs table (WITHOUT FOREIGN KEYS)
-- Description: Creates table for specialization FAQs using shared course_faq_categories
-- Use this if the foreign key constraints keep failing
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `specialization_faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `specialization_id` INT NOT NULL COMMENT 'FK to specializations.id',
  `category_id` INT NOT NULL COMMENT 'FK to course_faq_categories.id (shared categories)',
  `title` VARCHAR(500) NOT NULL COMMENT 'FAQ question',
  `description` TEXT NOT NULL COMMENT 'FAQ answer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_specialization_id` (`specialization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='FAQs for specializations using shared course FAQ categories';

