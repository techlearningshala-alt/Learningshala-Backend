-- Add qualification column to post_admission_team (run once on existing DB)
ALTER TABLE post_admission_team
ADD COLUMN qualification VARCHAR(500) NULL AFTER assist_student;
