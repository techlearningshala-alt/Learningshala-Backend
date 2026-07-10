-- Add verifier_name to blogs (mirrors courses.verifier_name)
ALTER TABLE blogs
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;
