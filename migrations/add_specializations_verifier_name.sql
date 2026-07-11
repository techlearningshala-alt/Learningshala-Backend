-- Add verifier_name to specializations (mirrors courses.verifier_name)
ALTER TABLE specializations
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;
