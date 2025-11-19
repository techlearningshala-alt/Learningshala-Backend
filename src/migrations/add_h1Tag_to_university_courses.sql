-- Migration: Add h1Tag column to university_courses table
-- Description: Adds h1Tag field for SEO and page title purposes
-- Author: CMS Admin
-- Date: 2025-01-XX

ALTER TABLE `university_courses`
ADD COLUMN `h1Tag` VARCHAR(500) DEFAULT NULL AFTER `name`;

