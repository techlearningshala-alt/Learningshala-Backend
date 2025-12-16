-- Migration: Add OTP column to website_leads table
-- Description: Adds OTP field for lead verification

ALTER TABLE `website_leads`
ADD COLUMN `otp` VARCHAR(6) DEFAULT NULL COMMENT '6-digit OTP for verification';

