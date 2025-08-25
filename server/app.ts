// server/app.ts - Simplified main server file
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Elysia, type Context } from 'elysia'

import { orm } from './db/drizzle'
import { env } from './lib/validation'
import { apiLogger } from './middleware/logging'
import { 
  applySecurityHeaders, 
  getCorsOrigins, 
  rateLimit, 
  defaultRateLimitOptions 
} from './lib/security'
import { apiRoutes } from './routes/api'
import { terminalRoutes } from './routes/terminal'

const { PORT } = env

// Apply migrations and seed initial data (ignore if table exists)
try {
  migrate(orm, { migrationsFolder: 'drizzle' })
} catch {
  // Migration already applied or table exists
}

// Security middleware
const securityMiddleware = (context: any) => {
  // Apply security headers
  applySecurityHeaders(context)
  
  // Apply rate limiting for all requests
  const rateLimitPassed = rateLimit(defaultRateLimitOptions)(context)
  
  if (!rateLimitPassed) {
    context.set.status = 429
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    }
  }
  
  return
}

const app = new Elysia()
  .use(cors({
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .onBeforeHandle(securityMiddleware)
  .use(apiLogger)
  .use(apiRoutes)
  .use(terminalRoutes)

// Serve the built client in production
if (process.env.NODE_ENV === 'production') {
  app.use(
    staticPlugin({
      prefix: '/', // serve at root
      assets: './dist/public', // Vite build output (relative to project root)
    })
  )

  // SSR render if server bundle exists; fallback to static index.html
  const indexHtml = Bun.file('dist/public/index.html')
  // Type definitions for SSR module
  interface SSRModule {
    render: (url: string) => string
    renderWithData: (url: string) => { html: string; data: Record<string, unknown> }
  }

  let ssrRender: null | ((url: string) => string) = null
  let ssrRenderWithData: null | ((url: string) => { html: string; data: Record<string, unknown> }) =
    null
  try {
    // @ts-ignore - SSR bundle may not exist during development
    const ssr = (await import('../dist/server/entry-server.js')) as SSRModule
    ssrRender = ssr.render
    ssrRenderWithData = ssr.renderWithData
    // SSR renderer loaded successfully
  } catch {
    // SSR renderer not found, serving static HTML
  }

  app.get('*', async ({ request, set }: Context) => {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api')) return
    try {
      const htmlText = await indexHtml.text()
      if (ssrRenderWithData || ssrRender) {
        let appHtml = ''
        let data: Record<string, unknown> | undefined
        const { pathname } = url
        if (ssrRenderWithData) {
          const { html, data: responseData } = ssrRenderWithData(request.url)
          appHtml = html
          data = responseData
        } else if (ssrRender) {
          appHtml = ssrRender(pathname)
        }
        let rendered = htmlText.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        if (data && Object.keys(data).length) {
          const script = `\n<script>window.__INITIAL_DATA__ = ${JSON.stringify(data).replace(/</g, '\\u003c')};</script>`
          rendered = rendered.replace('</body>', `${script}\n</body>`)
        }
        set.headers = { 
          'Content-Type': 'text/html; charset=utf-8'
        }
        return rendered
      } else {
        return new Response(indexHtml)
      }
    } catch {
      set.status = 500
      return 'SSR error'
    }
  })
}

app.listen({ port: PORT, hostname: '0.0.0.0' })
// Server listening on port ${PORT}
