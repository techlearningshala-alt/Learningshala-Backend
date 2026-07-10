-- Add verifier_name to courses (mirrors author_name)
ALTER TABLE courses
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;
