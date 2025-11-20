-- Add section_key column to university_sections table
-- Step 1: Add the column as nullable first (to handle existing records)
ALTER TABLE `university_sections` 
ADD COLUMN `section_key` VARCHAR(255) NULL AFTER `university_id`;

-- Step 2: Create index on section_key for better query performance
CREATE INDEX `idx_section_key` ON `university_sections` (`section_key`);

-- Step 3: Update existing records: Generate section_key from title
-- This converts title to section_key format: spaces -> underscores, remove special chars
-- Note: This matches the generateSectionKey function behavior in the backend
UPDATE `university_sections` 
SET `section_key` = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(TRIM(`title`), ' ', '_'),
                        '-', '_'
                    ),
                    '(', ''),
                ')', ''),
            '[', ''),
        ']', ''),
    '.', ''),
    ',', '')
WHERE `section_key` IS NULL;

-- Step 4: After updating existing records, make section_key NOT NULL
ALTER TABLE `university_sections` 
MODIFY COLUMN `section_key` VARCHAR(255) NOT NULL;

