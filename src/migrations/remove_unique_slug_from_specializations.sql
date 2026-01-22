-- Migration: Remove unique constraint on slug from specializations table
-- Description: Allow duplicate slugs for specializations (they can be same across different courses)
-- Author: CMS Admin
-- Date: 2025-01-XX

-- Drop the unique constraint on slug column
ALTER TABLE `specializations`
DROP INDEX `slug`;
