-- Migration: Create otp_verifications table
-- Description: Stores OTP codes for email verification during login
-- Author: CMS Admin
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL COMMENT 'User email address',
  `otp` VARCHAR(6) NOT NULL COMMENT '6-digit OTP code',
  `expires_at` TIMESTAMP NOT NULL COMMENT 'OTP expiration timestamp',
  `used` TINYINT(1) DEFAULT 0 COMMENT 'Whether OTP has been used (0 or 1)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email_otp` (`email`, `otp`),
  INDEX `idx_expires_at` (`expires_at`),
  INDEX `idx_email_created` (`email`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OTP codes for email verification during login';
