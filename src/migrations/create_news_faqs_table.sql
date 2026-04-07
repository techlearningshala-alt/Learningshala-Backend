-- Migration: Create news_faqs table
-- Description: FAQs attached to news items (mirrors blog_faqs without category_id)

CREATE TABLE IF NOT EXISTS `news_faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `news_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_news_faqs_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE,
  INDEX `idx_news_id` (`news_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
