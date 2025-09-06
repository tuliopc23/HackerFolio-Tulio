import { z } from 'zod'

// Generic validation helper
export function validateData<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`)
  }
  return result.data
}

// Command execution schema
export const executeCommandSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  args: z.array(z.string()).default([]),
})

export type ExecuteCommand = z.infer<typeof executeCommandSchema>
