-- Migration: Add label column to domains table
-- Description: Adds a label field to the domains table for short label/badge text
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `domains` 
ADD COLUMN `label` VARCHAR(255) DEFAULT NULL COMMENT 'Short label/badge text' AFTER `description`;
