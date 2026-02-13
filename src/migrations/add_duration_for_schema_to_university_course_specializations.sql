-- Migration: Add duration_for_schema field to university_course_specialization
-- Description: Adds duration_for_schema field for storing JSON duration data (for schema only)
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `university_course_specialization`
ADD COLUMN `duration_for_schema` TEXT NULL COMMENT 'Duration for schema only (JSON format: {month: "", year: ""})' AFTER `emi_duration`;
