-- Add priority column to universities (lower number = higher priority)
ALTER TABLE universities
ADD COLUMN priority INT NOT NULL DEFAULT 999 AFTER university_type_id;
