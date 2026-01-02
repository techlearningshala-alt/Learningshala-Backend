-- Add is_page_created column to universities table
ALTER TABLE `universities` 
ADD COLUMN `is_page_created` TINYINT(1) NOT NULL DEFAULT 1 
AFTER `is_active`;

-- Optional: Create index on is_page_created for better query performance (if needed)
-- CREATE INDEX `idx_is_page_created` ON `universities` (`is_page_created`);

