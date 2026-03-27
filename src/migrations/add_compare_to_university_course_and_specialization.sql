ALTER TABLE university_courses
ADD COLUMN `compare` TINYINT(1) NOT NULL DEFAULT 0 AFTER is_page_created;

ALTER TABLE university_course_specialization
ADD COLUMN `compare` TINYINT(1) NOT NULL DEFAULT 0 AFTER is_page_created;
