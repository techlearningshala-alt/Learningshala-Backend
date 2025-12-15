ALTER TABLE `courses`
ADD COLUMN `placement_partner_ids` JSON DEFAULT NULL COMMENT 'Array of placement partner IDs' AFTER `menu_visibility`,
ADD COLUMN `emi_partner_ids` JSON DEFAULT NULL COMMENT 'Array of EMI/financing partner IDs' AFTER `placement_partner_ids`;

