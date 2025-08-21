CREATE TABLE `portfolio_content` (
	`id` integer PRIMARY KEY NOT NULL,
	`section` text NOT NULL,
	`content` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tech_stack` text,
	`github_url` text,
	`live_url` text,
	`status` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `terminal_commands` (
	`id` integer PRIMARY KEY NOT NULL,
	`command` text NOT NULL,
	`description` text,
	`category` text,
	`response_template` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolio_content_section_unique` ON `portfolio_content` (`section`);--> statement-breakpoint
CREATE UNIQUE INDEX `terminal_commands_command_unique` ON `terminal_commands` (`command`);