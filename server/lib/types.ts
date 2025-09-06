import { z } from 'zod'

// API Response types
export const apiProjectSchema = z.object({
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
  isActive: z.boolean().nullable(),
  templateVariables: z.string().nullable(),
  argumentSchema: z.string().nullable(),
  examples: z.string().nullable(),
  aliases: z.string().nullable(),
  metadata: z.string().nullable(),
  permissions: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export const portfolioContentSchema = z.object({
  id: z.number(),
  section: z.string(),
  content: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export const serverCommandResultSchema = z.object({
  success: z.boolean(),
  output: z.string(),
  command: z.string(),
  timestamp: z.number(),
  executionTime: z.number().optional(),
  error: z.string().optional(),
})

export const executeCommandRequestSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).default([]),
})

// Type exports
export type ApiProject = z.infer<typeof apiProjectSchema>
export type TerminalCommand = z.infer<typeof terminalCommandSchema>
export type PortfolioContent = z.infer<typeof portfolioContentSchema>
export type ServerCommandResult = z.infer<typeof serverCommandResultSchema>
export type ExecuteCommandRequest = z.infer<typeof executeCommandRequestSchema>
