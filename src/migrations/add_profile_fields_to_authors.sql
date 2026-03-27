ALTER TABLE authors
ADD COLUMN linkedin_profile_link VARCHAR(500) NULL AFTER meta_description,
ADD COLUMN designation VARCHAR(255) NULL AFTER linkedin_profile_link,
ADD COLUMN education_background TEXT NULL AFTER designation;
