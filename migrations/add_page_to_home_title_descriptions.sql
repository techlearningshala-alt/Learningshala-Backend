ALTER TABLE home_title_descriptions
  ADD COLUMN page VARCHAR(255) NOT NULL DEFAULT '' AFTER id;
