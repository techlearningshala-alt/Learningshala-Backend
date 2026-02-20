-- Add 'video' to file_type ENUM in uploads table (for MP4 etc.)
-- Run after create_uploads_table.sql

ALTER TABLE `uploads` MODIFY COLUMN `file_type` ENUM('image', 'pdf', 'video') NOT NULL DEFAULT 'image' COMMENT 'Type of file';
