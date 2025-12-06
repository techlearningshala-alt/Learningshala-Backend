-- Migration: Add emi_duration column to university_courses table
-- Description: Adds emi_duration field to store EMI duration in months (integer value)
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `university_courses`
  ADD COLUMN `emi_duration` INT DEFAULT NULL COMMENT 'EMI Duration in months' AFTER `duration`;

