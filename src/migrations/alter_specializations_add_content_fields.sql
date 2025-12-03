-- Migration: Add additional content fields to specializations table
-- Description: Adds h1Tag, label, author_name, learning_mode, podcast_embed, upload_brochure, course_duration columns
-- Author: CMS Admin
-- Date: 2025-01-XX

DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDefinition TEXT,
    IN afterColumn VARCHAR(255)
)
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT *
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND COLUMN_NAME = columnName
    ) THEN
        -- If it doesn't exist, add the column
        SET @sql = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', columnName, '` ', columnDefinition, ' AFTER `', afterColumn, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL AddColumnIfNotExists('specializations', 'h1Tag', 'VARCHAR(255) DEFAULT NULL', 'slug');
CALL AddColumnIfNotExists('specializations', 'label', 'VARCHAR(255) DEFAULT NULL', 'h1Tag');
CALL AddColumnIfNotExists('specializations', 'author_name', 'VARCHAR(255) DEFAULT NULL', 'description');
CALL AddColumnIfNotExists('specializations', 'learning_mode', 'VARCHAR(255) DEFAULT NULL', 'author_name');
CALL AddColumnIfNotExists('specializations', 'podcast_embed', 'TEXT DEFAULT NULL', 'learning_mode');
CALL AddColumnIfNotExists('specializations', 'upload_brochure', 'VARCHAR(255) DEFAULT NULL', 'podcast_embed');
CALL AddColumnIfNotExists('specializations', 'course_duration', 'VARCHAR(255) DEFAULT NULL', 'upload_brochure');

-- Clean up the procedure
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

