// server/app.ts
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

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

const app = new Elysia()
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
      .get('/projects', () => ([
        {
          id: '1',
          name: 'Terminal Portfolio',
          description: 'A vintage CRT-inspired portfolio website with interactive terminal interface.',
          stack: ['React', 'TypeScript', 'Tailwind'],
          featured: true
        }
      ]))
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

  // SPA fallback: send index.html for non-API routes
  app.get('*', ({ request }) => {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api')) {
      return Bun.file('dist/public/index.html')
    }
  })
}

app.listen({ port: PORT, hostname: '0.0.0.0' })
console.log(`Elysia server listening on http://localhost:${PORT}`)
