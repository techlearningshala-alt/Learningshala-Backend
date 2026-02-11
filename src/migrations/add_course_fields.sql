-- Migration: Add duration_for_schema, eligibility, and eligibility_info columns to courses table
-- Description: Adds fields for duration schema (JSON), eligibility, and eligibility info
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `courses` 
ADD COLUMN `duration_for_schema` TEXT DEFAULT NULL COMMENT 'Duration for schema as JSON: {"month": "6", "year": ""} or {"month": "", "year": "1"}' AFTER `course_duration`,
ADD COLUMN `eligibility` TEXT DEFAULT NULL COMMENT 'Eligibility criteria' AFTER `duration_for_schema`,
ADD COLUMN `eligibility_info` TEXT DEFAULT NULL COMMENT 'Eligibility information with info button' AFTER `eligibility`;
