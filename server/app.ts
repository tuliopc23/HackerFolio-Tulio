// server/app.ts
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'
import { orm } from './db/drizzle'
import { projects as tProjects, terminalCommands as tCommands, portfolioContent as tContent } from './db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { sqlite } from './db/drizzle'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

const PORT = Number(process.env.PORT || 3001)

// Minimal request logging for /api routes
const logApi = (method: string, path: string, status: number, durationMs: number, body?: unknown) => {
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
  let line = `${time} [elysia] ${method} ${path} ${status} in ${durationMs}ms`
  if (body) {
    const json = JSON.stringify(body)
    if (json.length <= 80) line += ` :: ${json}`
  }
  console.log(line)
}

// Apply migrations and seed initial data
await migrate(sqlite, { migrationsFolder: 'drizzle' })

const app = new Elysia()
  .use(cors())
  // API routes
  .group('/api', app =>
    app
      .get('/health', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }))
      .get('/profile', () => ({
        name: 'Tulio Cunha',
        title: 'Full-stack Developer',
        location: 'Remote',
        status: 'Available for projects'
      }))
      .get('/projects', async () => {
        const rows = await orm.select({
          id: tProjects.id,
          name: tProjects.name,
          description: tProjects.description,
          tech_stack: tProjects.techStack,
          github_url: tProjects.githubUrl,
          live_url: tProjects.liveUrl,
          status: tProjects.status,
          created_at: tProjects.createdAt,
          updated_at: tProjects.updatedAt,
        }).from(tProjects).orderBy(desc(tProjects.createdAt))
        return rows.map((r) => ({
          ...r,
          tech_stack: r.tech_stack ? JSON.parse(r.tech_stack as any) : []
        }))
      })
      .get('/commands', async () => {
        const rows = await orm.select({
          command: tCommands.command,
          description: tCommands.description,
          category: tCommands.category,
          is_active: tCommands.isActive,
        }).from(tCommands).where(eq(tCommands.isActive, true)).orderBy(tCommands.command)
        return rows
      })
      .post('/commands/execute', async ({ body }) => {
        const { command, args } = body as { command?: string; args?: string[] }
        if (!command) return { error: 'command is required' }

        // Basic command lookup (allows toggling via is_active)
        const found = (await orm.select().from(tCommands).where(eq(tCommands.command, command)).limit(1)).at(0)
        if (!found) return { output: `Command not found: ${command}`, error: true }

        switch (command) {
          case 'help': {
            const cmds = await orm.select({ command: tCommands.command, description: tCommands.description, category: tCommands.category }).from(tCommands).where(eq(tCommands.isActive, true)).orderBy(tCommands.command)
            const byCat: Record<string, { command: string; description: string | null }[]> = {}
            for (const c of cmds) {
              const cat = c.category || 'misc'
              byCat[cat] ||= []
              byCat[cat].push({ command: c.command!, description: c.description ?? null })
            }
            const sections: string[] = []
            for (const [cat, rows] of Object.entries(byCat)) {
              const maxLen = Math.max(12, ...rows.map(r => r.command.length))
              const header = `${cat.toUpperCase()}\n` + `COMMAND`.padEnd(maxLen) + '  DESCRIPTION'
              const line = '-'.repeat(header.split('\n').pop()!.length)
              const body = rows.map(r => `${r.command.padEnd(maxLen)}  ${r.description ?? ''}`).join('\n')
              sections.push(`${header}\n${line}\n${body}`)
            }
            return { output: sections.join('\n\n') }
          }
          case 'projects': {
            const projects = await orm.select({
              name: tProjects.name,
              description: tProjects.description,
              tech_stack: tProjects.techStack,
              github_url: tProjects.githubUrl,
              live_url: tProjects.liveUrl,
              status: tProjects.status,
            }).from(tProjects).orderBy(desc(tProjects.createdAt))
            if (projects.length === 0) return { output: 'No projects found' }
            const text = projects.map(p => {
              const stack = ((p.tech_stack as any) ? JSON.parse(p.tech_stack as any) : []) as string[]
              const parts = [
                `• ${p.name}`,
                p.description ? `  ${p.description}` : undefined,
                `  Stack: ${stack.length ? stack.join(', ') : '-'}`,
                `  GitHub: ${p.github_url ?? '-'}`,
                `  Live: ${p.live_url ?? '-'}`,
                `  Status: ${p.status ?? '-'}`
              ].filter(Boolean)
              return parts!.join('\n')
            }).join('\n\n')
            return { output: text }
          }
          case 'about': {
            const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'about')).limit(1)).at(0) as any
            const content = row?.content ? JSON.parse(row.content) : { markdown: '' }
            const md = content.markdown ?? 'About section not available.'
            return { output: md }
          }
          case 'skills': {
            const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'skills')).limit(1)).at(0) as any
            const content = row?.content ? JSON.parse(row.content) : { list: [] }
            const list: string[] = Array.isArray(content.list) ? content.list : []
            if (!list.length) return { output: 'No skills found' }
            const items = list.map(s => `- ${s}`).join('\n')
            return { output: `Skills\n------\n${items}` }
          }
          case 'contact': {
            const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'contact')).limit(1)).at(0) as any
            const c = row?.content ? JSON.parse(row.content) : {}
            const lines = [
              c.email ? `Email   : ${c.email}` : null,
              c.github ? `GitHub  : ${c.github}` : null,
              c.linkedin ? `LinkedIn: ${c.linkedin}` : null,
              c.twitter ? `Twitter : ${c.twitter}` : null
            ].filter(Boolean)
            if (!lines.length) return { output: 'No contact info available' }
            const sep = '-----------------------'
            return { output: `Contact\n${sep}\n${lines.join('\n')}` }
          }
          case 'github': {
            const profile = (found as any).responseTemplate || process.env.GITHUB_PROFILE || 'https://github.com/tuliopc23'
            return { output: `GitHub\n------\nProfile: ${profile}` }
          }
          case 'resume': {
            const url = (found as any).responseTemplate || process.env.RESUME_URL || 'Resume not configured. Set RESUME_URL env var.'
            return { output: typeof url === 'string' && url.startsWith('http') ? `Resume\n------\nURL: ${url}` : String(url) }
          }
          case 'clear':
            // Frontend interprets CLEAR specially
            return { output: 'CLEAR' }
          default:
            return { output: found.responseTemplate ?? `${command} executed` }
        }
      })
      .get('/github/:owner/:repo/commits', async ({ params, query }) => {
        const { owner, repo } = params as { owner: string; repo: string }
        const limit = Math.min(Number(query.limit ?? 10), 50)
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github+json'
        }
        if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`, { headers })
          if (!res.ok) throw new Error(`GitHub error ${res.status}`)
          const data = await res.json()
          return data.map((c: any) => ({
            sha: c.sha,
            message: c.commit?.message,
            author: c.commit?.author?.name,
            date: c.commit?.author?.date,
            url: c.html_url
          }))
        } catch (e: any) {
          return { error: 'Failed to fetch commits', message: e?.message }
        }
      })
      .get('/content/:section', async ({ params }) => {
        const row = (await orm.select({ section: tContent.section, content: tContent.content, updated_at: tContent.updatedAt }).from(tContent).where(eq(tContent.section, params.section)).limit(1)).at(0)
        if (!row) return { section: params.section, content: null }
        return { section: row.section!, content: row.content ? JSON.parse(row.content) : null, updated_at: row.updated_at }
      })
      .put('/content/:section', async ({ params, body }) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body
        const content = JSON.stringify(payload?.content ?? {})
        // Upsert by section
        await orm.run(sql`INSERT INTO portfolio_content (section, content) VALUES (${params.section}, ${content}) ON CONFLICT(section) DO UPDATE SET content=excluded.content, updated_at=CURRENT_TIMESTAMP`)
        return { ok: true }
      })
      .post('/terminal/log', ({ body }) => {
        const { command, timestamp } = body as { command?: string; timestamp?: string }
        if (command) console.log(`Terminal command: ${command} at ${timestamp ?? 'unknown time'}`)
        return { logged: true }
      })
      // simple onAfterHandle logger for API
      .onAfterHandle(({ request, set, response }) => {
        const startHeader = request.headers.get('x-start-time')
        const started = startHeader ? Number(startHeader) : undefined
        const duration = started ? Date.now() - started : 0
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api')) {
          logApi(request.method, url.pathname, Number(set.status) ?? 200, duration)
        }
      })
      .onBeforeHandle(({ request }) => {
        // mark start time for simple duration measurement
        const headers = new Headers(request.headers)
        headers.set('x-start-time', String(Date.now()))
        return new Request(request, { headers })
      })
  )

// Serve the built client in production
if (process.env.NODE_ENV === 'production') {
  app.use(staticPlugin({
    prefix: '/',            // serve at root
    assets: './dist/public' // Vite build output (relative to project root)
  }))

  // SSR render if server bundle exists; fallback to static index.html
  const indexHtml = Bun.file('dist/public/index.html')
  let ssrRender: null | ((url: string) => Promise<string>) = null
  let ssrRenderWithData: null | ((url: string) => Promise<{ html: string; data: Record<string, any> }>) = null
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - dynamic import path at runtime
    const ssr = await import('../dist/server/entry-server.js')
    ssrRender = ssr.render as (url: string) => Promise<string>
    ssrRenderWithData = ssr.renderWithData as (url: string) => Promise<{ html: string; data: Record<string, any> }>
    console.log('SSR renderer loaded')
  } catch {
    console.warn('SSR renderer not found, serving static HTML')
  }

  app.get('*', async ({ request, set }) => {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api')) return
    try {
      const htmlText = await indexHtml.text()
      if (ssrRenderWithData || ssrRender) {
        let appHtml = ''
        let data: Record<string, any> | undefined
        if (ssrRenderWithData) {
          const r = await ssrRenderWithData(request.url)
          appHtml = r.html
          data = r.data
        } else if (ssrRender) {
          appHtml = await ssrRender(url.pathname)
        }
        let rendered = htmlText.replace('<div id="root"></div>', `<div id=\"root\">${appHtml}</div>`) 
        if (data && Object.keys(data).length) {
          const script = `\n<script>window.__INITIAL_DATA__ = ${JSON.stringify(data).replace(/</g, '\\u003c')};</script>`
          rendered = rendered.replace('</body>', `${script}\n</body>`)
        }
        set.headers = { 'Content-Type': 'text/html; charset=utf-8' }
        return rendered
      } else {
        return new Response(indexHtml)
      }
    } catch (e) {
      set.status = 500
      return 'SSR error'
    }
  })
}

app.listen({ port: PORT, hostname: '0.0.0.0' })
console.log(`Elysia server listening on http://localhost:${PORT}`)
