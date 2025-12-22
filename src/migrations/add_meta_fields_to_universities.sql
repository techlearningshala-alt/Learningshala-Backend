-- Add meta_title and meta_description to universities table
ALTER TABLE universities
ADD COLUMN meta_title VARCHAR(60) NULL AFTER university_slug,
ADD COLUMN meta_description VARCHAR(160) NULL AFTER meta_title;

