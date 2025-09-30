import { z } from 'zod'

// Simple environment validation for portfolio app
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  GITHUB_TOKEN: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

export function validateEnvironment(): EnvConfig {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`)
  }

  return result.data
}

export const env = validateEnvironment()
