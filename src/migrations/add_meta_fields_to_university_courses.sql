-- Add meta_title and meta_description to university_courses table
ALTER TABLE university_courses
ADD COLUMN meta_title VARCHAR(60) NULL AFTER h1Tag,
ADD COLUMN meta_description VARCHAR(160) NULL AFTER meta_title;

