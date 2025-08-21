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

// ANSI color helpers
const ansi = {
  wrap: (s: string, ...codes: number[]) => `\x1b[${codes.join(';')}m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[39m`,
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
  underline: (s: string) => `\x1b[4m${s}\x1b[24m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
}

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
        const { command, args = [] } = body as { command?: string; args?: string[] }
        if (!command) return { error: 'command is required' }

        // Basic command lookup (allows toggling via is_active)
        const found = (await orm.select().from(tCommands).where(eq(tCommands.command, command)).limit(1)).at(0)
        if (!found) return { output: ansi.red(`Command not found: ${command}`), error: true }

        switch (command) {
          case 'help': {
            const cmds = await orm
              .select({ command: tCommands.command, description: tCommands.description, category: tCommands.category })
              .from(tCommands)
              .where(eq(tCommands.isActive, true))
              .orderBy(tCommands.command)

            const argsArr = Array.isArray(args) ? args : []
            const target = (argsArr[0] || '').toLowerCase()

            // Detailed help per command
            if (target) {
              const usage: Record<string, { desc: string; usage: string; examples?: string[] }> = {
                help: { desc: 'Show general or command-specific help', usage: 'help [command]', examples: ['help', 'help projects'] },
                projects: { desc: 'List projects with optional filter/flags', usage: 'projects [filter] [--limit N|--per N] [--page N] [--status STATUS] [--stack TECH]', examples: ['projects', 'projects react --limit 5', 'projects --status active', 'projects --per 5 --page 2'] },
                whoami: { desc: 'Display profile information', usage: 'whoami' },
                stack: { desc: 'Display technical skills list', usage: 'stack' },
                grep: { desc: 'Search helpers (stack supported)', usage: 'grep stack' },
                about: { desc: 'Show about content', usage: 'about' },
                skills: { desc: 'Show skills content', usage: 'skills' },
                contact: { desc: 'Show contact information', usage: 'contact' },
                github: { desc: 'Show GitHub profile link', usage: 'github' },
                resume: { desc: 'Show resume URL', usage: 'resume' },
                time: { desc: 'Show current time', usage: 'time' },
                clear: { desc: 'Clear terminal', usage: 'clear' },
              }
              const u = usage[target]
              if (!u) return { output: ansi.red(`No help for '${target}'`), error: true }
              const lines = [
                `${ansi.magenta(ansi.bold('Command'))}: ${ansi.cyan(target)}`,
                `${ansi.magenta('Description')}: ${u.desc}`,
                `${ansi.magenta('Usage')}: ${ansi.cyan(u.usage)}`,
              ]
              if (u.examples?.length) {
                lines.push(ansi.magenta('Examples') + ':')
                for (const ex of u.examples) lines.push('  ' + ansi.cyan(ex))
              }
              return { output: lines.join('\n') }
            }

            // General grouped help
            const byCat: Record<string, { command: string; description: string | null }[]> = {}
            for (const c of cmds) {
              const cat = c.category || 'misc'
              byCat[cat] ||= []
              byCat[cat].push({ command: c.command!, description: c.description ?? null })
            }
            const sections: string[] = []
            const wrap = (txt: string, width: number, indent: string) => {
              const words = String(txt ?? '').split(/\s+/)
              const lines: string[] = []
              let line = ''
              for (const word of words) {
                const next = line ? line + ' ' + word : word
                if (indent.length + next.length > width) {
                  if (line) lines.push(line)
                  line = word
                } else {
                  line = next
                }
              }
              if (line) lines.push(line)
              return lines.map((l, i) => (i === 0 ? l : indent + l)).join('\n')
            }
            for (const [cat, rows] of Object.entries(byCat)) {
              const col = Math.max(12, Math.min(22, ...rows.map(r => r.command.length)))
              const header = ansi.magenta(ansi.bold(cat.toUpperCase())) + '\n' + ansi.cyan('COMMAND'.padEnd(col)) + '  ' + ansi.cyan('DESCRIPTION')
              const line = '-'.repeat(('COMMAND'.padEnd(col) + '  ' + 'DESCRIPTION').length)
              const body = rows
                .map(r => {
                  const left = ansi.cyan(r.command.padEnd(col))
                  const right = wrap(r.description ?? '', 80, ' '.repeat(col + 2))
                  const [first, ...rest] = right.split('\n')
                  return [left + '  ' + first, ...rest].join('\n')
                })
                .join('\n')
              sections.push(`${header}\n${ansi.dim(line)}\n${body}`)
            }
            return { output: sections.join('\n\n') }
          }
          
          case 'projects': {
            // Parse flags and free-text filter
            let filter = ''
            let per: number | null = null
            let limit: number | null = null // alias for per
            let page: number | null = null
            let status: string | null = null
            let stackFilter: string | null = null
            const tokens = Array.isArray(args) ? [...args] : []
            for (let i = 0; i < tokens.length; i++) {
              const t = tokens[i]
              if (t === '--per' && tokens[i + 1]) { per = Number(tokens[++i]) || null; continue }
              if (t.startsWith('--per=')) { per = Number(t.split('=')[1]) || null; continue }
              if (t === '--page' && tokens[i + 1]) { page = Number(tokens[++i]) || null; continue }
              if (t.startsWith('--page=')) { page = Number(t.split('=')[1]) || null; continue }
              if (t === '--limit' && tokens[i + 1]) { limit = Number(tokens[++i]) || null; continue }
              if (t.startsWith('--limit=')) { limit = Number(t.split('=')[1]) || null; continue }
              if (t === '--status' && tokens[i + 1]) { status = String(tokens[++i]).toLowerCase(); continue }
              if (t.startsWith('--status=')) { status = String(t.split('=')[1]).toLowerCase(); continue }
              if (t === '--stack' && tokens[i + 1]) { stackFilter = String(tokens[++i]).toLowerCase(); continue }
              if (t.startsWith('--stack=')) { stackFilter = String(t.split('=')[1]).toLowerCase(); continue }
              filter += (filter ? ' ' : '') + t
            }
            filter = filter.toLowerCase().trim()
            const projects = await orm.select({
              name: tProjects.name,
              description: tProjects.description,
              tech_stack: tProjects.techStack,
              github_url: tProjects.githubUrl,
              live_url: tProjects.liveUrl,
              status: tProjects.status,
            }).from(tProjects).orderBy(desc(tProjects.createdAt))
            let list = projects
            if (filter) {
              list = projects.filter(p => {
                const name = (p.name ?? '').toLowerCase()
                const desc = (p.description ?? '').toLowerCase()
                const stackArr: string[] = ((p.tech_stack as any) ? JSON.parse(p.tech_stack as any) : [])
                const stack = stackArr.join(' ').toLowerCase()
                return name.includes(filter) || desc.includes(filter) || stack.includes(filter)
              })
            }
            if (status) {
              list = list.filter(p => String(p.status || '').toLowerCase() === status)
            }
            if (stackFilter) {
              list = list.filter(p => {
                const arr: string[] = ((p.tech_stack as any) ? JSON.parse(p.tech_stack as any) : [])
                return arr.some(x => String(x).toLowerCase().includes(stackFilter!))
              })
            }
            if (list.length === 0) return { output: filter ? ansi.yellow(`No projects found matching '${filter}'`) : ansi.yellow('No projects found') }

            // Pagination calculations
            const total = list.length
            const effPer = Math.max(1, Math.min(50, per ?? limit ?? 5))
            const totalPages = Math.max(1, Math.ceil(total / effPer))
            const effPage = Math.max(1, Math.min(page ?? 1, totalPages))
            const start = (effPage - 1) * effPer
            const end = Math.min(total, start + effPer)
            const pageItems = list.slice(start, end)

            const text = pageItems.map(p => {
              const stack = ((p.tech_stack as any) ? JSON.parse(p.tech_stack as any) : []) as string[]
              const parts = [
                `${ansi.magenta('•')} ${ansi.cyan(ansi.bold(String(p.name)))}`,
                p.description ? `  ${p.description}` : undefined,
                `  ${ansi.magenta('Stack')}: ${stack.length ? ansi.cyan(stack.join(', ')) : '-'}`,
                `  ${ansi.magenta('GitHub')}: ${p.github_url ? ansi.underline(ansi.cyan(p.github_url)) : '-'}`,
                `  ${ansi.magenta('Live')}: ${p.live_url ? ansi.underline(ansi.cyan(p.live_url)) : '-'}`,
                `  ${ansi.magenta('Status')}: ${ansi.cyan(p.status ?? '-')}`
              ].filter(Boolean)
              return parts!.join('\n')
            }).join('\n\n')
            const baseFlags = [
              filter ? filter : '',
              status ? `--status ${status}` : '',
              stackFilter ? `--stack ${stackFilter}` : '',
              `--per ${effPer}`,
            ].filter(Boolean).join(' ')
            const header = `${ansi.dim(`Page ${effPage}/${totalPages} • Showing ${start + 1}-${end} of ${total}`)}`
            const hints: string[] = []
            if (effPage > 1) hints.push(`${ansi.magenta('Prev')}: ${ansi.cyan(`projects ${baseFlags} --page ${effPage - 1}`)}`)
            if (effPage < totalPages) hints.push(`${ansi.magenta('Next')}: ${ansi.cyan(`projects ${baseFlags} --page ${effPage + 1}`)}`)
            const footer = hints.length ? `\n\n${hints.join('\n')}` : ''
            return { output: `${header}\n\n${text}${footer}` }
          }
          case 'about': {
            const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'about')).limit(1)).at(0) as any
            const content = row?.content ? JSON.parse(row.content) : { markdown: '' }
            const md = content.markdown ?? 'About section not available.'
            return { output: ansi.cyan(md) }
          }
          case 'skills': {
            const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'skills')).limit(1)).at(0) as any
            const content = row?.content ? JSON.parse(row.content) : { list: [] }
            const list: string[] = Array.isArray(content.list) ? content.list : []
            if (!list.length) return { output: ansi.yellow('No skills found') }
            const items = list.map(s => `${ansi.magenta('-')} ${ansi.cyan(String(s))}`).join('\n')
            return { output: `${ansi.magenta(ansi.bold('Skills'))}\n${ansi.dim('------')}\n${items}` }
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
            if (!lines.length) return { output: ansi.yellow('No contact info available') }
            const sep = '-----------------------'
            return { output: `${ansi.magenta(ansi.bold('Contact'))}\n${ansi.dim(sep)}\n${lines.join('\n')}` }
          }
          case 'github': {
            const profile = (found as any).responseTemplate || process.env.GITHUB_PROFILE || 'https://github.com/tuliopc23'
            return { output: `${ansi.magenta(ansi.bold('GitHub'))}\n${ansi.dim('------')}\n${ansi.magenta('Profile')}: ${ansi.underline(ansi.cyan(String(profile)))}` , action: { type: 'open_url', url: String(profile) } }
          }
          case 'resume': {
            const url = (found as any).responseTemplate || process.env.RESUME_URL || 'Resume not configured. Set RESUME_URL env var.'
            if (typeof url === 'string' && url.startsWith('http')) {
              return { output: `${ansi.magenta(ansi.bold('Resume'))}\n${ansi.dim('------')}\n${ansi.magenta('URL')}: ${ansi.underline(ansi.cyan(url))}`, action: { type: 'open_url', url } }
            }
            return { output: ansi.yellow(String(url)) }
          }
          case 'time': {
            const now = new Date()
            return { output: now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }) }
          }
          case 'grep': {
            const sub = (args?.[0] || '').toLowerCase()
            if (sub === 'stack') {
              const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'skills')).limit(1)).at(0) as any
              const content = row?.content ? JSON.parse(row.content) : { list: [] }
              const list: string[] = Array.isArray(content.list) ? content.list : []
              const items = list.length ? list.map(s => `${ansi.magenta('-')} ${ansi.cyan(String(s))}`).join('\n') : ansi.yellow('-')
              return { output: `${ansi.magenta(ansi.bold('Stack'))}\n${ansi.dim('-----')}\n${items}` }
            }
            return { output: ansi.red(`grep: '${args?.join(' ')}' - try 'grep stack'`), error: true }
          }
          case 'whoami': {
            const profile = { name: 'Tulio Cunha', title: 'Full-stack Developer', location: 'Remote', status: 'Available for projects' }
            const lines = [
              `${ansi.magenta('Name')}    : ${ansi.cyan(profile.name)}`,
              `${ansi.magenta('Role')}    : ${ansi.cyan(profile.title)}`,
              `${ansi.magenta('Location')}: ${ansi.cyan(profile.location)}`,
              `${ansi.magenta('Status')}  : ${ansi.cyan(profile.status)}`,
            ]
            return { output: `${ansi.magenta(ansi.bold('Profile'))}\n${ansi.dim('-------')}\n${lines.join('\n')}` }
          }
          case 'stack': {
            const row = (await orm.select({ content: tContent.content }).from(tContent).where(eq(tContent.section, 'skills')).limit(1)).at(0) as any
            const content = row?.content ? JSON.parse(row.content) : { list: [] }
            const list: string[] = Array.isArray(content.list) ? content.list : []
            const items = list.length ? list.map(s => `- ${s}`).join('\n') : '-'
            return { output: `Stack\n-----\n${items}` }
          }
          case 'clear':
            // Frontend interprets CLEAR specially
            return { output: 'CLEAR' }
          default:
            return { output: found.responseTemplate ? String(found.responseTemplate) : ansi.green(`${command} executed`) }
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
