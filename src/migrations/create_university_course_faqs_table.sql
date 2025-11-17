-- Create university_course_faqs table
-- This table stores FAQs for university courses
-- FAQ categories are shared with university_faq_categories table
CREATE TABLE IF NOT EXISTS university_course_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES university_faq_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES university_courses(id) ON DELETE CASCADE,
  INDEX idx_category_id (category_id),
  INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

