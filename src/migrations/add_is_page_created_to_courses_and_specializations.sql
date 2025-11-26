-- Add is_page_created column to university_courses table
ALTER TABLE `university_courses` 
ADD COLUMN `is_page_created` TINYINT(1) NOT NULL DEFAULT 1 
AFTER `is_active`;

-- Add is_page_created column to university_course_specialization table
ALTER TABLE `university_course_specialization` 
ADD COLUMN `is_page_created` TINYINT(1) NOT NULL DEFAULT 1 
AFTER `is_active`;

-- Optional: Create index on is_page_created for better query performance (if needed)
-- CREATE INDEX `idx_is_page_created` ON `university_courses` (`is_page_created`);
-- CREATE INDEX `idx_is_page_created` ON `university_course_specialization` (`is_page_created`);

