-- Migration: Alter fee_types to add key and drop amount
-- Description: Introduce a unique key column and remove amount column as per new requirements
-- Author: CMS Admin
-- Date: 2025-11-13

ALTER TABLE `fee_types`
  ADD COLUMN `fee_key` VARCHAR(255) NOT NULL AFTER `title`,
  DROP COLUMN `amount`,
  ADD UNIQUE KEY `uniq_fee_types_key` (`fee_key`);


