-- Add tag column to authors (writer | verifier)
ALTER TABLE authors
ADD COLUMN tag ENUM('writer', 'verifier') NULL DEFAULT 'writer' AFTER label;
