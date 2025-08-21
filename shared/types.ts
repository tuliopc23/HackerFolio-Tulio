import { z } from 'zod'

// Re-export server types for client use
export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  techStack: z.string().nullable(),
  githubUrl: z.string().nullable(),
  liveUrl: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export const terminalCommandSchema = z.object({
  id: z.number(),
  command: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  responseTemplate: z.string().nullable(),
  isActive: z.boolean(),
})

export const portfolioContentSchema = z.object({
  id: z.number(),
  section: z.string(),
  content: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

// API response schemas
export const commandActionSchema = z.object({
  type: z.literal('open_url'),
  url: z.string().url(),
})

export const serverCommandResultSchema = z.object({
  output: z.string(),
  error: z.boolean().optional(),
  action: commandActionSchema.optional(),
})

export const executeCommandRequestSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
})

// Client-side API project schema (with transformed fields)
export const apiProjectSchema = projectSchema
  .extend({
    tech_stack: z.array(z.string()).optional(),
    github_url: z.string().optional(),
    live_url: z.string().optional(),
    appstore_url: z.string().optional(),
    image: z.string().optional(),
    stats: z
      .object({
        performance: z.string().optional(),
        accessibility: z.string().optional(),
      })
      .optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .omit({ techStack: true, githubUrl: true, liveUrl: true, createdAt: true, updatedAt: true })

// Type exports
export type Project = z.infer<typeof projectSchema>
export type TerminalCommand = z.infer<typeof terminalCommandSchema>
export type PortfolioContent = z.infer<typeof portfolioContentSchema>
export type CommandAction = z.infer<typeof commandActionSchema>
export type ServerCommandResult = z.infer<typeof serverCommandResultSchema>
export type ExecuteCommandRequest = z.infer<typeof executeCommandRequestSchema>
export type ApiProject = z.infer<typeof apiProjectSchema>
