// server/app.ts - Simplified main server file
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Elysia, type Context } from 'elysia'

import { orm } from './db/drizzle'
import {
  applySecurityHeaders,
  getCorsOrigins,
  rateLimit,
  defaultRateLimitOptions,
} from './lib/security'
import { env } from './lib/validation'
import { apiLogger } from './middleware/logging'
import { apiRoutes } from './routes/api'
import { terminalRoutes } from './routes/terminal'

const { PORT } = env

// Apply migrations and seed initial data (ignore if table exists)
try {
  migrate(orm, { migrationsFolder: 'drizzle' })
} catch {
  // Migration already applied or table exists
}

// Security middleware using derive pattern
const securityMiddleware = (context: Record<string, unknown>) => {
  // Apply security headers
  applySecurityHeaders(context as Context)

  // Apply rate limiting for all requests
  const rateLimitPassed = rateLimit(defaultRateLimitOptions)(context as Context)

  if (!rateLimitPassed) {
    ;(context as Context).set.status = 429
    return {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    }
  }

  return {}
}

const app = new Elysia()
  .use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .derive(securityMiddleware)
  .use(apiLogger)
  .use(apiRoutes)
  .use(terminalRoutes)

// Serve the built client in production
if (process.env.NODE_ENV === 'production') {
  // Auto-detect static dir (dist/public preferred, fallback to dist)
  const STATIC_DIRS = ['./dist/public', './dist'] as const
  let staticDir: (typeof STATIC_DIRS)[number] = './dist/public'
  try {
    for (const d of STATIC_DIRS) {
      const f = Bun.file(`${d}/index.html`)
      // deno-lint-ignore no-await-in-loop
      if (await f.exists()) {
        staticDir = d
        console.log(`Using static directory: ${staticDir}`)
        break
      }
    }
  } catch (error) {
    console.error('Static directory detection error:', error)
    staticDir = './dist/public' // explicit fallback
  }

  app.use(
    staticPlugin({
      assets: staticDir, // Vite build output (relative to project root)
      prefix: '/', // serve at root
      staticLimits: {
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0', // Cache assets in production
      },
    })
  )

  // SSR render if server bundle exists; fallback to static index.html
  const indexHtml = Bun.file(`${staticDir}/index.html`)
  // Type definitions for SSR module
  interface SSRModule {
    render: (url: string) => string
    renderWithData: (url: string) => { html: string; data: Record<string, unknown> }
  }

  let ssrRender: null | ((url: string) => string) = null
  let ssrRenderWithData: null | ((url: string) => { html: string; data: Record<string, unknown> }) =
    null
  // Try common SSR output locations (prefer dist/server)
  const SSR_CANDIDATES = [
    '../dist/server/entry-server.js',
    '../dist/entry-server.js',
    '../dist/ssr/entry-server.js',
  ] as const
  for (const p of SSR_CANDIDATES) {
    try {
      // @ts-ignore - SSR bundle may not exist during development
      const ssr = (await import(p)) as SSRModule
      ssrRender = ssr.render
      ssrRenderWithData = ssr.renderWithData
      break
    } catch {
      // no-op: try next SSR candidate
      void 0
    }
  }

  app.get('*', async ({ request, set }: Context) => {
    const url = new URL(request.url)
    
    // Don't handle API routes
    if (url.pathname.startsWith('/api')) return
    
    // Don't handle asset routes - let static plugin handle them
    if (url.pathname.startsWith('/assets/') || 
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.png') || 
        url.pathname.endsWith('.jpg') || 
        url.pathname.endsWith('.svg') || 
        url.pathname.endsWith('.ico')) {
      return // Let static plugin handle these
    }
    
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
          'Content-Type': 'text/html; charset=utf-8',
        }
        return rendered
      } else {
        set.headers = {
          'Content-Type': 'text/html; charset=utf-8',
        }
        return new Response(indexHtml)
      }
    } catch {
      set.status = 500
      return 'SSR error'
    }
  })
}

app.listen({ port: PORT, hostname: '0.0.0.0' })

// eslint-disable-next-line no-console
console.log(`Server listening on port ${String(PORT)}`)
