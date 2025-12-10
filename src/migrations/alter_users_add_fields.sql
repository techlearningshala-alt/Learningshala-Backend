-- Add new fields to users table
ALTER TABLE users
ADD COLUMN phone VARCHAR(20) NULL AFTER role,
ADD COLUMN course VARCHAR(255) NULL AFTER phone,
ADD COLUMN state INT NULL AFTER course,
ADD COLUMN city INT NULL AFTER state,
ADD COLUMN otp VARCHAR(10) NULL AFTER city;

-- Add foreign key constraints (optional - uncomment if you want referential integrity)
-- ALTER TABLE users
-- ADD CONSTRAINT fk_user_state FOREIGN KEY (state) REFERENCES states(id) ON DELETE SET NULL,
-- ADD CONSTRAINT fk_user_city FOREIGN KEY (city) REFERENCES cities(id) ON DELETE SET NULL;

