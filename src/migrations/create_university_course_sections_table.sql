CREATE TABLE IF NOT EXISTS `university_course_sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `section_key` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `component` VARCHAR(255) NOT NULL,
  `props` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `university_courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_section_key` (`section_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

