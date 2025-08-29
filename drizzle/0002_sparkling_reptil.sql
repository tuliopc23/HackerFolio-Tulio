ALTER TABLE `terminal_commands` ADD `template_variables` text;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `argument_schema` text;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `examples` text;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `aliases` text;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `metadata` text;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `permissions` text;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `terminal_commands` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP;