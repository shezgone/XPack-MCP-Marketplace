ALTER TABLE `user_apikey`
ADD COLUMN `is_deleted` INT NOT NULL DEFAULT 0 COMMENT 'Soft delete flag: 0=active, 1=deleted' AFTER `updated_at`;

INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`)
VALUES ('xpack-version','version', '1.3.2', 'Add user_apikey soft delete column', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;