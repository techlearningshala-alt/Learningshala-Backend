ALTER TABLE home_title_descriptions
  ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'home' AFTER id;

UPDATE home_title_descriptions SET type = 'home' WHERE type IS NULL OR type = '';
