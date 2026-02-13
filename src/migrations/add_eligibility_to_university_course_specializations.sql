-- Migration: Add eligibility fields to university_course_specialization
-- Description: Adds eligibility (short) and eligibility_info (i button) fields
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `university_course_specialization`
ADD COLUMN `eligibility` TEXT NULL COMMENT 'Eligibility (in short)' AFTER `emi_duration`,
ADD COLUMN `eligibility_info` TEXT NULL COMMENT 'Eligibility information (i button)' AFTER `eligibility`;

