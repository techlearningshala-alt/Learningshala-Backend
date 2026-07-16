-- Verifier name (same pattern as blogs / courses)
ALTER TABLE universities
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;

ALTER TABLE university_courses
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;

ALTER TABLE university_course_specialization
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;

ALTER TABLE news
ADD COLUMN verifier_name VARCHAR(255) NULL AFTER author_name;
