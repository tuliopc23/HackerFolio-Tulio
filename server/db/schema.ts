import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  techStack: text('tech_stack'), // JSON string
  githubUrl: text('github_url'),
  liveUrl: text('live_url'),
  status: text('status'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const terminalCommands = sqliteTable('terminal_commands', {
  id: integer('id').primaryKey(),
  command: text('command').notNull().unique(),
  description: text('description'),
  category: text('category'),
  responseTemplate: text('response_template'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
})

export const portfolioContent = sqliteTable('portfolio_content', {
  id: integer('id').primaryKey(),
  section: text('section').notNull().unique(),
  content: text('content'), // JSON string
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

