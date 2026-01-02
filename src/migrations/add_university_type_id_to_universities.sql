-- Add university_type_id column to universities table
ALTER TABLE `universities` 
ADD COLUMN `university_type_id` INT NULL 
AFTER `author_name`,
ADD INDEX `idx_university_type_id` (`university_type_id`),
ADD CONSTRAINT `fk_universities_university_type` 
  FOREIGN KEY (`university_type_id`) 
  REFERENCES `university_types` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

