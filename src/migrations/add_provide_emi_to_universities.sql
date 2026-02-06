-- Migration: Add provide_emi column to universities table
-- Description: Adds provide_emi field to indicate if university provides EMI options (yes/no)
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `universities` 
ADD COLUMN `provide_emi` BOOLEAN DEFAULT FALSE COMMENT 'Whether university provides EMI options' AFTER `menu_visibility`;
