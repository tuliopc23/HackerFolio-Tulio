import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

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

// Zod schemas for validation
export const insertProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  techStack: z.string().optional(), // JSON string validation
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'completed', 'archived']).optional(),
})

export const selectProjectSchema = createSelectSchema(projects)

export const insertTerminalCommandSchema = createInsertSchema(terminalCommands, {
  command: z.string().min(1, 'Command is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  responseTemplate: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const selectTerminalCommandSchema = createSelectSchema(terminalCommands)

export const insertPortfolioContentSchema = createInsertSchema(portfolioContent, {
  section: z.string().min(1, 'Section is required'),
  content: z.string().optional(), // JSON string validation
})

export const selectPortfolioContentSchema = createSelectSchema(portfolioContent)

// Additional validation schemas for API endpoints
export const projectQuerySchema = z.object({
  id: z.coerce.number().optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
})

export const terminalCommandQuerySchema = z.object({
  command: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const portfolioContentQuerySchema = z.object({
  section: z.string().optional(),
})

// Type exports for use in other files
export type Project = z.infer<typeof selectProjectSchema>
export type NewProject = z.infer<typeof insertProjectSchema>
export type TerminalCommand = z.infer<typeof selectTerminalCommandSchema>
export type NewTerminalCommand = z.infer<typeof insertTerminalCommandSchema>
export type PortfolioContent = z.infer<typeof selectPortfolioContentSchema>
export type NewPortfolioContent = z.infer<typeof insertPortfolioContentSchema>
export type ProjectQuery = z.infer<typeof projectQuerySchema>
export type TerminalCommandQuery = z.infer<typeof terminalCommandQuerySchema>
export type PortfolioContentQuery = z.infer<typeof portfolioContentQuerySchema>
