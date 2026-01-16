-- Add priority column to faq_categories table
ALTER TABLE `faq_categories`
ADD COLUMN `priority` INT NOT NULL DEFAULT 999 AFTER `heading`;

-- Add index for better performance when ordering by priority
CREATE INDEX `idx_priority` ON `faq_categories` (`priority`);
