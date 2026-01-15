-- Add priority column to university_faq_categories table
ALTER TABLE `university_faq_categories`
ADD COLUMN `priority` INT NOT NULL DEFAULT 999 AFTER `heading`;

-- Add index for better performance when ordering by priority
CREATE INDEX `idx_priority` ON `university_faq_categories` (`priority`);
