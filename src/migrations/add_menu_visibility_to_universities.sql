-- Add menu_visibility column to universities table
-- Description: Controls home page visibility for each university
-- Author: CMS Admin
-- Date: 2025-01-20

ALTER TABLE `universities`
ADD COLUMN `menu_visibility` TINYINT(1) NOT NULL DEFAULT 1 AFTER `is_page_created`;

-- Optional: index for filtering by visibility
-- CREATE INDEX `idx_menu_visibility` ON `universities` (`menu_visibility`);

