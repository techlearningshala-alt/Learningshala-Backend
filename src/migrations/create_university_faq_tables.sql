-- Create university_faq_categories table
CREATE TABLE IF NOT EXISTS university_faq_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  heading VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create university_faqs table
CREATE TABLE IF NOT EXISTS university_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES university_faq_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
  INDEX idx_category_id (category_id),
  INDEX idx_university_id (university_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

