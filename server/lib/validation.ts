import type { Context } from 'elysia'
import { z } from 'zod'

// Generic validation helper
export function validateData<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`)
  }
  return result.data
}

// Elysia context validation helper
export function validateQuery<T>(schema: z.ZodType<T>, context: Context): T {
  return validateData(schema, context.query)
}

export function validateBody<T>(schema: z.ZodType<T>, context: Context): T {
  return validateData(schema, context.body)
}

// Removed unused validateParams, apiResponseSchema, and paginatedResponseSchema

// Command execution schemas
export const executeCommandSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  args: z.array(z.string()).default([]),
})

export type ExecuteCommand = z.infer<typeof executeCommandSchema>

// Environment variable validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

// Validate environment variables
export const env = validateData(envSchema, process.env)
