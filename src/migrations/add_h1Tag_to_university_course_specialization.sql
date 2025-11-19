-- Migration: Add h1Tag column to university_course_specialization table
-- Description: Adds h1Tag field for SEO and page title purposes
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `university_course_specialization`
ADD COLUMN `h1Tag` VARCHAR(500) DEFAULT NULL AFTER `name`;

