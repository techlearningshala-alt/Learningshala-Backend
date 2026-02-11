-- Migration: Drop duration_unit column from courses table
-- Description: Removes legacy duration_unit field now that duration_for_schema JSON is used instead
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `courses`
DROP COLUMN `duration_unit`;

