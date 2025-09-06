import { desc, eq, sql } from 'drizzle-orm'
import { Elysia, type Context } from 'elysia'

import { orm } from '../db/drizzle'
import {
  projects as tProjects,
  terminalCommands as tCommands,
  portfolioContent as tContent,
  selectProjectSchema,
  projectQuerySchema,
  type Project,
} from '../db/schema'
import {
  createSuccessResponse,
  createMissingParameterError,
  createDatabaseError,
  createExternalApiError,
  createValidationError,
  handleApiError,
  validateApiQuery,
  ApiError,
} from '../lib/error-handling'
import { validateData } from '../lib/validation'

export const apiRoutes = new Elysia({ prefix: '/api' })
  .onError(({ error }) => handleApiError(error))
  .get('/health', async () => {
    // Check if static files exist
    const staticChecks = {
      indexHtml: false,
      assetsDir: false,
    }

    try {
      const indexFile = Bun.file('./dist/public/index.html')
      staticChecks.indexHtml = await indexFile.exists()

      const fs = await import('node:fs')
      staticChecks.assetsDir = fs.existsSync('./dist/public/assets')
    } catch (error) {
      console.error('Health check static file error:', error)
    }

    // DB status: table presence and basic counts
    const db = {
      ok: false as boolean,
      counts: { terminal_commands: 0, projects: 0 },
      error: undefined as string | undefined,
    }

    try {
      // Light-weight count queries; if tables are missing, this will throw
      const tc = await orm
        .select({ c: sql`count(*)`.mapWith(Number) })
        .from(tCommands)
        .limit(1)
      const pj = await orm
        .select({ c: sql`count(*)`.mapWith(Number) })
        .from(tProjects)
        .limit(1)

      db.counts.terminal_commands = tc.at(0)?.c ?? 0
      db.counts.projects = pj.at(0)?.c ?? 0
      db.ok = true
    } catch (error) {
      db.ok = false
      db.error = error instanceof Error ? error.message : 'Unknown DB error'
    }

    return createSuccessResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      staticFiles: staticChecks,
      db,
    })
  })
  .get('/profile', () =>
    createSuccessResponse({
      name: 'Tulio Cunha',
      title: 'Full-stack Developer',
      location: 'Remote',
      status: 'Available for projects',
    })
  )
  .get('/projects', async (context: Context) => {
    try {
      const query = validateApiQuery(projectQuerySchema, context)

      const rows = await orm
        .select()
        .from(tProjects)
        .orderBy(desc(tProjects.createdAt))
        .limit(query.limit)
        .offset(query.offset)

      // Validate and transform the database results
      const validatedProjects: Project[] = rows.map((row: unknown) =>
        validateData(selectProjectSchema, row)
      )

      const transformedProjects = validatedProjects.map(project => ({
        ...project,
        tech_stack: project.techStack ? JSON.parse(project.techStack) : [],
      }))

      return createSuccessResponse(transformedProjects)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw createDatabaseError('Failed to fetch projects', error)
    }
  })
  .get('/content/:section', async ({ params }: Context) => {
    try {
      if (!params.section) {
        throw createMissingParameterError('section')
      }

      const row = (
        await orm
          .select({
            section: tContent.section,
            content: tContent.content,
            updated_at: tContent.updatedAt,
          })
          .from(tContent)
          .where(eq(tContent.section, params.section))
          .limit(1)
      ).at(0)

      if (!row) {
        return createSuccessResponse({
          section: params.section,
          content: null,
        })
      }

      return createSuccessResponse({
        section: row.section,
        content: row.content ? JSON.parse(row.content) : null,
        updated_at: row.updated_at,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw createDatabaseError('Failed to fetch content', error)
    }
  })
  .put('/content/:section', ({ params, body }: Context) => {
    try {
      if (!params.section) {
        throw createMissingParameterError('section')
      }

      interface UpsertContentBody {
        content?: Record<string, unknown>
      }

      const payload = (typeof body === 'string' ? JSON.parse(body) : body) as UpsertContentBody
      const content = JSON.stringify(payload.content ?? {})

      // Use sql template for upsert
      orm.run(
        sql`INSERT INTO portfolio_content (section, content) VALUES (${params.section}, ${content}) ON CONFLICT(section) DO UPDATE SET content=excluded.content, updated_at=CURRENT_TIMESTAMP`
      )

      return createSuccessResponse({ ok: true, section: params.section })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      if (error instanceof SyntaxError) {
        throw createValidationError('Invalid JSON in request body')
      }
      throw createDatabaseError('Failed to update content', error)
    }
  })
  .post('/terminal/log', ({ body }: Context) => {
    try {
      // Type guard for terminal log request
      interface TerminalLogRequest {
        command?: string
        timestamp?: string
      }

      function isTerminalLogRequest(data: unknown): data is TerminalLogRequest {
        return (
          typeof data === 'object' &&
          data !== null &&
          (!('command' in data) || typeof (data as Record<string, unknown>).command === 'string') &&
          (!('timestamp' in data) ||
            typeof (data as Record<string, unknown>).timestamp === 'string')
        )
      }

      if (!isTerminalLogRequest(body)) {
        throw createValidationError('Invalid request body format')
      }

      const { command } = body
      if (command) {
        // Terminal command logged: ${command}
      }
      return createSuccessResponse({ logged: true })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw createValidationError('Invalid request body')
    }
  })
  .get('/github/:owner/:repo/commits', async ({ params, query }: Context) => {
    try {
      const { owner, repo } = params as { owner: string; repo: string }
      const limit = Math.min(Number(query.limit ?? 10), 50)

      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
      }
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
      }

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${String(limit)}`,
        { headers }
      )

      if (!res.ok) {
        throw createExternalApiError('GitHub', `HTTP ${String(res.status)}`, {
          status: res.status,
          statusText: res.statusText,
        })
      }

      const data = (await res.json()) as Array<{
        sha: string
        commit: {
          message: string
          author: { name: string; date: string }
        }
        html_url: string
      }>

      const commits = data.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url,
      }))

      return createSuccessResponse(commits)
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw createExternalApiError('GitHub', (error as Error).message)
    }
  })
