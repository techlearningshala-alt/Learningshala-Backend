-- Migration: Add CRUD permission fields to users table
-- Description: Adds can_create, can_read, can_update, can_delete fields for role-based permissions
-- Author: CMS Admin
-- Date: 2025-01-30

-- Add permission columns
ALTER TABLE `users` 
ADD COLUMN `can_create` TINYINT(1) DEFAULT 0 COMMENT 'Permission to create resources' AFTER `otp`,
ADD COLUMN `can_read` TINYINT(1) DEFAULT 0 COMMENT 'Permission to read resources' AFTER `can_create`,
ADD COLUMN `can_update` TINYINT(1) DEFAULT 0 COMMENT 'Permission to update resources' AFTER `can_read`,
ADD COLUMN `can_delete` TINYINT(1) DEFAULT 0 COMMENT 'Permission to delete resources' AFTER `can_update`;

-- Set default permissions for existing admin users (all permissions = 1)
UPDATE `users` SET `can_create` = 1, `can_read` = 1, `can_update` = 1, `can_delete` = 1 WHERE `role` = 'admin';

-- Set default permissions for existing mentor users (read only by default)
UPDATE `users` SET `can_create` = 0, `can_read` = 1, `can_update` = 0, `can_delete` = 0 WHERE `role` = 'mentor';

