-- Migration: Add section_access to users (blog, news, university)

ALTER TABLE `users`
ADD COLUMN `section_access` JSON NULL COMMENT 'Allowed admin sections: blog, news, university' AFTER `can_delete`;
