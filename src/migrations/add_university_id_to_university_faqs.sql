-- Migration: Add university_id column to existing university_faqs table
-- Run this if the table already exists without university_id

-- Add university_id column
ALTER TABLE university_faqs 
ADD COLUMN university_id INT NOT NULL AFTER id;

-- Add foreign key constraint
ALTER TABLE university_faqs
ADD CONSTRAINT fk_university_faqs_university 
  FOREIGN KEY (university_id) 
  REFERENCES universities(id) 
  ON DELETE CASCADE;

-- Add index for better query performance
ALTER TABLE university_faqs
ADD INDEX idx_university_id (university_id);

-- Note: If you have existing data, you may need to set a default university_id
-- UPDATE university_faqs SET university_id = 1 WHERE university_id IS NULL OR university_id = 0;
-- (Replace 1 with an actual university ID from your database)

