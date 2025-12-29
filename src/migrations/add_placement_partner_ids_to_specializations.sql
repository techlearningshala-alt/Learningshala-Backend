-- Migration: Add placement_partner_ids to specializations table
-- Description: Stores selected placement partner IDs for each specialization
-- Author: CMS Admin
-- Date: 2025-01-30

-- Add the column
ALTER TABLE `specializations` 
ADD COLUMN `placement_partner_ids` JSON DEFAULT NULL COMMENT 'Array of placement partner IDs' AFTER `priority`;

-- Add index for better query performance (if needed)
-- Note: JSON columns can be indexed using generated columns in MySQL 5.7.8+

