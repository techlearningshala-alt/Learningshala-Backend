-- Migration: Add duration_for_schema, eligibility, eligibility_info, and emi_facility columns to specializations table
-- Description: Adds fields for duration schema (JSON), eligibility, eligibility info, and EMI facility
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `specializations` 
ADD COLUMN `duration_for_schema` TEXT DEFAULT NULL COMMENT 'Duration for schema as JSON: {"month": "6", "year": ""} or {"month": "", "year": "1"}' AFTER `course_duration`,
ADD COLUMN `eligibility` TEXT DEFAULT NULL COMMENT 'Eligibility criteria' AFTER `duration_for_schema`,
ADD COLUMN `eligibility_info` TEXT DEFAULT NULL COMMENT 'Eligibility information with info button' AFTER `eligibility`,
ADD COLUMN `emi_facility` TINYINT(1) DEFAULT 0 COMMENT 'EMI facility available (1=yes, 0=no)' AFTER `podcast_embed`;
