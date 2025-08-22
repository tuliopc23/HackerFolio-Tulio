import { Elysia, type Context } from 'elysia'
import { desc, eq, sql } from 'drizzle-orm'

import { orm } from '../db/drizzle'
import {
  projects as tProjects,
  portfolioContent as tContent,
  selectProjectSchema,
  projectQuerySchema,
  type Project,
} from '../db/schema'
import { validateQuery, validateData } from '../lib/validation'

export const apiRoutes = new Elysia({ prefix: '/api' })
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))
  .get('/profile', () => ({
    name: 'Tulio Cunha',
    title: 'Full-stack Developer',
    location: 'Remote',
    status: 'Available for projects',
  }))
  .get('/projects', async (context: Context) => {
    const query = validateQuery(projectQuerySchema, context)

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

    return validatedProjects.map(project => ({
      ...project,
      tech_stack: project.techStack ? JSON.parse(project.techStack) : [],
    }))
  })
  .get('/content/:section', async ({ params }: Context) => {
    if (!params.section) {
      throw new Error('Missing "section" parameter')
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
    if (!row) return { section: params.section, content: null }
    return {
      section: row.section,
      content: row.content ? JSON.parse(row.content) : null,
      updated_at: row.updated_at,
    }
  })
  .put('/content/:section', async ({ params, body }: Context) => {
    if (!params.section) {
      throw new Error('Missing "section" parameter')
    }

    interface UpsertContentBody {
      content?: unknown | Record<string, unknown>
    }

    const payload = (typeof body === 'string' ? JSON.parse(body) : body) as UpsertContentBody
    const content = JSON.stringify(
      (payload && typeof payload === 'object' && 'content' in payload ? payload.content : {}) ??
        {}
    )
    // Use sql template for upsert
    await orm.run(
      sql`INSERT INTO portfolio_content (section, content) VALUES (${params.section}, ${content}) ON CONFLICT(section) DO UPDATE SET content=excluded.content, updated_at=CURRENT_TIMESTAMP`
    )
    return { ok: true }
  })
  .post('/terminal/log', ({ body }: Context) => {
    const { command, timestamp } = body as { command?: string; timestamp?: string }
    if (command) {
      // In production, use proper structured logging
      console.log(`Terminal command: ${command} at ${timestamp ?? 'unknown time'}`)
    }
    return { logged: true }
  })
  .get('/github/:owner/:repo/commits', async ({ params, query }: Context) => {
    const { owner, repo } = params as { owner: string; repo: string }
    const limit = Math.min(Number(query.limit ?? 10), 50)
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${String(limit)}`,
        { headers }
      )
      if (!res.ok) throw new Error(`GitHub error ${res.status}`)
      const data = (await res.json()) as Array<{
        sha: string
        commit: {
          message: string
          author: { name: string; date: string }
        }
        html_url: string
      }>
      return data.map(c => ({
        sha: c.sha,
        message: c.commit?.message,
        author: c.commit?.author?.name,
        date: c.commit?.author?.date,
        url: c.html_url,
      }))
    } catch (e: unknown) {
      return { error: 'Failed to fetch commits', message: (e as Error)?.message }
    }
  })