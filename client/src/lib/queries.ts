import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
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
} from '@server/lib/types'

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

// Handle both wrapped { success, data } responses and bare data arrays/objects
function parseApiResponse<T>(schema: z.ZodType<T>, raw: unknown): T {
  const WrappedSuccess = z.object({ success: z.literal(true), data: schema, timestamp: z.string() })
  const WrappedError = z.object({
    success: z.literal(false),
    error: z.object({ message: z.string() }).loose(),
    timestamp: z.string(),
  })

  const ok = WrappedSuccess.safeParse(raw)
  if (ok.success) return ok.data.data

  const err = WrappedError.safeParse(raw)
  if (err.success) throw new Error(err.data.error.message)

  // Fallback: treat as bare data
  return validateResponse(schema, raw)
}

// Base fetch functions (for use in server-side and non-hook contexts)
export async function fetchProjects(): Promise<ApiProject[]> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/projects`)
  if (!res.ok) throw new Error('Failed to fetch projects')

  const data = await res.json()
  return parseApiResponse(z.array(apiProjectSchema), data)
}

export async function fetchCommands(): Promise<TerminalCommand[]> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/api/commands`)
  if (!res.ok) throw new Error('Failed to fetch commands')

  const data = await res.json()
  return parseApiResponse(z.array(terminalCommandSchema), data)
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

// Query Keys - centralized for easy invalidation and caching
export const queryKeys = {
  projects: ['projects'] as const,
  commands: ['commands'] as const,
  content: (section: string) => ['content', section] as const,
  all: ['api'] as const,
} as const

// TanStack Query Hooks
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

export function useCommands() {
  return useQuery({
    queryKey: queryKeys.commands,
    queryFn: fetchCommands,
    staleTime: 10 * 60 * 1000, // Commands rarely change
    gcTime: 60 * 60 * 1000, // Keep for 1 hour
  })
}

export function useContent(section: string) {
  return useQuery({
    queryKey: queryKeys.content(section),
    queryFn: () => fetchContent(section),
    staleTime: 10 * 60 * 1000, // Content changes infrequently
    gcTime: 30 * 60 * 1000,
    enabled: Boolean(section), // Only fetch if section is provided
  })
}

export function useExecuteCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ command, args = [] }: { command: string; args?: string[] }) =>
      executeCommand(command, args),
    onSuccess: () => {
      // Invalidate and refetch commands list in case new commands were added
      void queryClient.invalidateQueries({ queryKey: queryKeys.commands })
    },
    // Retry failed commands once (some commands might be flaky)
    retry: 1,
    retryDelay: 1000,
  })
}

// Prefetch helpers for SSR and route preloading
export function prefetchProjects(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  })
}

export function prefetchContent(queryClient: QueryClient, section: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.content(section),
    queryFn: () => fetchContent(section),
    staleTime: 10 * 60 * 1000,
  })
}

export function prefetchCommands(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.commands,
    queryFn: fetchCommands,
    staleTime: 10 * 60 * 1000,
  })
}

// Re-export types for convenience
export type { ApiProject, TerminalCommand, ServerCommandResult, PortfolioContent }
