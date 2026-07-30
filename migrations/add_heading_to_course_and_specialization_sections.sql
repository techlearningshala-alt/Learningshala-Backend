-- Add heading to Menu course & specialization sections

ALTER TABLE `course_sections`
ADD COLUMN `heading` VARCHAR(255) DEFAULT NULL COMMENT 'Section display heading' AFTER `title`;

ALTER TABLE `specialization_sections`
ADD COLUMN `heading` VARCHAR(255) DEFAULT NULL COMMENT 'Section display heading' AFTER `title`;
