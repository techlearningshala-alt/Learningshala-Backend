-- Migration: Create leads table
-- Description: Creates the leads table with all fields for lead management
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL COMMENT 'Lead name',
  `email` VARCHAR(150) DEFAULT NULL COMMENT 'Lead email address',
  `phone` VARCHAR(15) DEFAULT NULL COMMENT 'Lead phone number (10 digits)',
  `course` VARCHAR(150) DEFAULT NULL COMMENT 'Course name',
  `specialisation` VARCHAR(150) DEFAULT NULL COMMENT 'Specialisation name',
  `state` VARCHAR(100) DEFAULT NULL COMMENT 'State',
  `city` VARCHAR(100) DEFAULT NULL COMMENT 'City',
  `lead_source` VARCHAR(150) DEFAULT NULL COMMENT 'Lead source',
  `sub_source` VARCHAR(150) DEFAULT NULL COMMENT 'Sub source',
  `highest_qualification` VARCHAR(150) DEFAULT NULL COMMENT 'Highest qualification',
  `preferred_budget` VARCHAR(20) DEFAULT NULL COMMENT 'Preferred budget',
  `emi_required` VARCHAR(10) DEFAULT NULL COMMENT 'EMI required (Yes/No)',
  `salary` VARCHAR(20) DEFAULT NULL COMMENT 'Current salary',
  `percentage` VARCHAR(10) DEFAULT NULL COMMENT 'Percentage/Score',
  `experience` VARCHAR(10) DEFAULT NULL COMMENT 'Years of experience',
  `currently_employed` VARCHAR(10) DEFAULT NULL COMMENT 'Currently employed (Yes/No)',
  `university_for_placement_salaryhike_promotions` VARCHAR(255) DEFAULT NULL COMMENT 'University for placement, salary hike, or promotions',
  `utm_source` VARCHAR(150) DEFAULT NULL COMMENT 'UTM source parameter',
  `utm_campaign` VARCHAR(150) DEFAULT NULL COMMENT 'UTM campaign parameter',
  `utm_adgroup` VARCHAR(150) DEFAULT NULL COMMENT 'UTM ad group parameter',
  `utm_ads` VARCHAR(150) DEFAULT NULL COMMENT 'UTM ads parameter',
  `created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Lead creation timestamp',
  `website_url` VARCHAR(2048) DEFAULT NULL COMMENT 'Website URL where lead was captured',
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_created_on` (`created_on`),
  INDEX `idx_course` (`course`),
  INDEX `idx_lead_source` (`lead_source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores lead information from various sources';

