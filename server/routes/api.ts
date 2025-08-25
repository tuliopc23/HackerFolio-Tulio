import { desc, eq, sql } from 'drizzle-orm'
import { Elysia, type Context } from 'elysia'

import { orm } from '../db/drizzle'
import {
  projects as tProjects,
  portfolioContent as tContent,
  selectProjectSchema,
  projectQuerySchema,
  type Project,
} from '../db/schema'
import { validateQuery, validateData } from '../lib/validation'
import {
  createSuccessResponse,
  createErrorResponse,
  createNotFoundError,
  createMissingParameterError,
  createDatabaseError,
  createExternalApiError,
  createValidationError,
  handleApiError,
  validateApiQuery,
  ApiError,
  type ApiResponse,
} from '../lib/error-handling'
import {
  rateLimit,
  apiRateLimitOptions,
  InputSanitizer,
  SecurityLogger,
  getClientId
} from '../lib/security'

// API rate limiting middleware
const apiRateLimit = (context: Context) => {
  const rateLimitPassed = rateLimit(apiRateLimitOptions)(context)
  
  if (!rateLimitPassed) {
    SecurityLogger.log({
      type: 'rate_limit',
      clientId: getClientId(context),
      timestamp: Date.now(),
      details: {
        endpoint: context.request.url,
        method: context.request.method
      }
    })
    
    throw new Error('API rate limit exceeded')
  }
  
  return true
}

export const apiRoutes = new Elysia({ prefix: '/api' })
  .onError(({ error }) => handleApiError(error))
  .derive(apiRateLimit)
  .get('/health', () => createSuccessResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .get('/profile', () => createSuccessResponse({
    name: 'Tulio Cunha',
    title: 'Full-stack Developer',
    location: 'Remote',
    status: 'Available for projects',
  }))
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
  .put('/content/:section', async ({ params, body }: Context) => {
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
      await orm.run(
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
      const { command } = body as { command?: string; timestamp?: string }
      if (command) {
        // Terminal command logged: ${command}
      }
      return createSuccessResponse({ logged: true })
    } catch (error) {
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
        throw createExternalApiError('GitHub', `HTTP ${res.status}`, {
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
