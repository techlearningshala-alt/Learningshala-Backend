-- Add heading column to university_faq_categories if it doesn't exist
-- This migration is safe to run multiple times

-- Check if column exists and add it if it doesn't
SET @dbname = DATABASE();
SET @tablename = "university_faq_categories";
SET @columnname = "heading";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column heading already exists in university_faq_categories' AS message;",
  "ALTER TABLE university_faq_categories ADD COLUMN heading VARCHAR(255) NOT NULL DEFAULT '' AFTER id;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

