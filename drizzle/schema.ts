import { sqliteTable, AnySQLiteColumn, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const projects = sqliteTable("projects", {
	id: integer().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	techStack: text("tech_stack"),
	githubUrl: text("github_url"),
	liveUrl: text("live_url"),
	status: text(),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
});

export const terminalCommands = sqliteTable("terminal_commands", {
	id: integer().primaryKey().notNull(),
	command: text().notNull(),
	description: text(),
	category: text(),
	responseTemplate: text("response_template"),
	isActive: integer("is_active").default(true),
	templateVariables: text("template_variables"),
	argumentSchema: text("argument_schema"),
	examples: text(),
	aliases: text(),
	metadata: text(),
	permissions: text(),
	createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`"),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
},
(table) => [
	uniqueIndex("terminal_commands_command_unique").on(table.command),
]);

export const portfolioContent = sqliteTable("portfolio_content", {
	id: integer().primaryKey().notNull(),
	section: text().notNull(),
	content: text(),
	updatedAt: text("updated_at").default("sql`(CURRENT_TIMESTAMP)`"),
},
(table) => [
	uniqueIndex("portfolio_content_section_unique").on(table.section),
]);

