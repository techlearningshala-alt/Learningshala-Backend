-- Migration: Add emi_partner_ids to universities table
-- Description: Stores selected EMI partner IDs for each university
-- Author: CMS Admin
-- Date: 2025-01-30

-- Add the column
ALTER TABLE `universities` 
ADD COLUMN `emi_partner_ids` JSON DEFAULT NULL COMMENT 'Array of EMI partner IDs';

-- Add index for better query performance (if needed)
-- Note: JSON columns can be indexed using generated columns in MySQL 5.7.8+

