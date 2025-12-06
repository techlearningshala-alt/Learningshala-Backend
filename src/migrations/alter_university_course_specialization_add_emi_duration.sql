-- Migration: Add emi_duration column to university_course_specialization table
-- Description: Adds emi_duration field to store EMI duration in months (integer value)
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `university_course_specialization`
  ADD COLUMN `emi_duration` INT DEFAULT NULL COMMENT 'EMI Duration in months' AFTER `duration`;

