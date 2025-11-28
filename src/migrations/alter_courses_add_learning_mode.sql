-- Migration: Add learning_mode column to courses table
-- Description: Adds learning_mode field to store course delivery mode (Online, Distance, Hybrid, etc.)
-- Author: CMS Admin
-- Date: 2025-01-XX

DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists_learning_mode()
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT *
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'courses'
        AND COLUMN_NAME = 'learning_mode'
    ) THEN
        -- If it doesn't exist, add the column
        ALTER TABLE `courses` ADD COLUMN `learning_mode` VARCHAR(255) DEFAULT NULL AFTER `author_name`;
    END IF;
END //

DELIMITER ;

CALL AddColumnIfNotExists_learning_mode();

-- Clean up the procedure
DROP PROCEDURE IF EXISTS AddColumnIfNotExists_learning_mode;

