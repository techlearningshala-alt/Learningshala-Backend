-- Migration: Remove category_id from blog_faqs table
-- Description: Simplify blog FAQs to only have questions and answers without categories
-- Author: CMS Admin
-- Date: 2025-02-08

-- Drop foreign key constraint first
ALTER TABLE `blog_faqs`
  DROP FOREIGN KEY IF EXISTS `blog_faqs_ibfk_1`;

-- Drop index on category_id
ALTER TABLE `blog_faqs`
  DROP INDEX IF EXISTS `idx_category_id`;

-- Remove category_id column
ALTER TABLE `blog_faqs`
  DROP COLUMN `category_id`;
