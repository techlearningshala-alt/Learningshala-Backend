-- Migration: Add Compare Information fields to universities table
-- Date: 2024

ALTER TABLE universities
  ADD COLUMN university_tag_line VARCHAR(255) NULL AFTER emi_partner_ids,
  ADD COLUMN establishment_year VARCHAR(10) NULL AFTER university_tag_line,
  ADD COLUMN emi_provides TINYINT(1) NOT NULL DEFAULT 0 AFTER establishment_year,
  ADD COLUMN university_features TEXT NULL AFTER emi_provides,
  ADD COLUMN education_mode VARCHAR(50) NULL AFTER university_features,
  ADD COLUMN admission_mode VARCHAR(20) NULL AFTER education_mode,
  ADD COLUMN examination_mode VARCHAR(50) NULL AFTER admission_mode,
  ADD COLUMN scholarship_provides VARCHAR(255) NULL AFTER examination_mode,
  ADD COLUMN alumni_status VARCHAR(255) NULL AFTER scholarship_provides,
  ADD COLUMN online_classes TINYINT(1) NOT NULL DEFAULT 0 AFTER alumni_status,
  ADD COLUMN placement_assistance TINYINT(1) NOT NULL DEFAULT 0 AFTER online_classes,
  ADD COLUMN why_choose TEXT NULL AFTER placement_assistance;
