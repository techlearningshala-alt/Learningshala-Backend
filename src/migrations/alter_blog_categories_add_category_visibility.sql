ALTER TABLE blog_categories
  ADD COLUMN category_visibility TINYINT(1) NOT NULL DEFAULT 0 AFTER category_slug;

