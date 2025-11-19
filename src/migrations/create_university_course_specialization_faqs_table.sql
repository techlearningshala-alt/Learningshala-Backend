-- Create university_course_specialization_faqs table
-- This table stores FAQs for university course specializations
-- FAQ categories are shared with university_faq_categories table
CREATE TABLE IF NOT EXISTS university_course_specialization_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  specialization_id INT UNSIGNED NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES university_faq_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES university_course_specialization(id) ON DELETE CASCADE,
  INDEX idx_category_id (category_id),
  INDEX idx_specialization_id (specialization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

