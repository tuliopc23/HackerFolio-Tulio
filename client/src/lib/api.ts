// client/src/lib/api.ts
import { z } from 'zod'

import {
  type ApiProject,
  type TerminalCommand,
  type ServerCommandResult,
  type PortfolioContent,
  apiProjectSchema,
  terminalCommandSchema,
  serverCommandResultSchema,
  portfolioContentSchema,
  executeCommandRequestSchema,
} from '../../../shared/types'

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    const fromEnv = process.env.SSR_BASE_URL
    if (fromEnv) return fromEnv
    const port = process.env.PORT ?? '3001'
    return `http://127.0.0.1:${port}`
  }
  return ''
}

// Validation helper
function validateResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid API response: ${result.error.message}`)
  }
  return result.data
}

export async function fetchProjects(): Promise<ApiProject[]> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/projects`)
  if (!res.ok) throw new Error('Failed to fetch projects')

  const data = await res.json()
  return validateResponse(z.array(apiProjectSchema), data)
}

export async function fetchCommands(): Promise<TerminalCommand[]> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/commands`)
  if (!res.ok) throw new Error('Failed to fetch commands')

  const data = await res.json()
  return validateResponse(z.array(terminalCommandSchema), data)
}

export async function executeCommand(
  command: string,
  args: string[] = []
): Promise<ServerCommandResult> {
  // Validate request data
  const requestData = validateResponse(executeCommandRequestSchema, { command, args })

  const base = getBaseUrl()
  const res = await fetch(`${base}/api/commands/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  })

  const data = await res.json()

  if (!res.ok) {
    // Try to extract error message from server response
    interface ErrorResponse {
      error?: { message?: string }
      message?: string
    }
    const errorData = data as ErrorResponse
    const errorMessage =
      errorData.error?.message ??
      errorData.message ??
      `HTTP ${res.status.toString()}: ${res.statusText}`
    throw new Error(errorMessage)
  }

  return validateResponse(serverCommandResultSchema, data)
}

export async function fetchContent(section: string): Promise<PortfolioContent> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/content/${encodeURIComponent(section)}`)
  if (!res.ok) throw new Error('Failed to fetch content')

  const data = await res.json()
  return validateResponse(portfolioContentSchema, data)
}

// Re-export types for convenience
export type { ApiProject, TerminalCommand, ServerCommandResult, PortfolioContent }
export type { CommandAction } from '../../../shared/types'
