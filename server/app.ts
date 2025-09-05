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
      origin: (origin: string | undefined | unknown) => {
        // Dynamic CORS - allow same origin and configured origins
        const allowedOrigins = getCorsOrigins()

        // Handle case where CORS library passes request object instead of string
        let originString: string | undefined
        if (typeof origin === 'string') {
          originString = origin
        } else if (origin && typeof origin === 'object' && 'headers' in origin) {
          // Extract origin from request headers
          const headers = (origin as { headers: { get?: (key: string) => string | null; origin?: string } }).headers
          originString = headers.get?.('origin') ?? headers.origin ?? undefined
        } else {
          originString = undefined
        }

        // If no origin (same-origin requests), allow
        if (!originString) {
          return true
        }

        // Check against configured origins
        if (allowedOrigins.includes('*')) {
          return true
        }
        if (allowedOrigins.includes(originString)) {
          return true
        }

        // For PaaS deployments, be more permissive with HTTPS origins
        if (process.env.NODE_ENV === 'production' && originString.startsWith('https://')) {
          console.log(`🔍 Allowing HTTPS origin: ${originString}`)
          return true
        }

        console.log(`❌ Blocked origin: ${originString}`)
        return false
      },
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

  console.log('🔍 Detecting static directory...')
  console.log('Current working directory:', process.cwd())

  try {
    for (const d of STATIC_DIRS) {
      const f = Bun.file(`${d}/index.html`)
      // deno-lint-ignore no-await-in-loop
      if (await f.exists()) {
        staticDir = d
        console.log(`✅ Using static directory: ${staticDir}`)

        // Check for assets directory
        try {
          const fs = await import('node:fs')
          const assetExists = fs.existsSync(`${d}/assets`)
          console.log(`📁 Assets directory exists: ${String(assetExists)}, path: ${d}/assets`)

          // List files in assets directory for debugging
          if (assetExists) {
            const assetFiles = fs.readdirSync(`${d}/assets`)
            console.log(
              `📄 Asset files (${String(assetFiles.length)}):`,
              assetFiles.slice(0, 5).join(', ')
            )
          }
        } catch (e) {
          console.log('⚠️ Could not check assets directory:', e)
        }
        break
      }
    }
  } catch (error) {
    console.error('❌ Static directory detection error:', error)
    staticDir = './dist/public' // explicit fallback
  }

  // Add static plugin and manual fallback
  console.log('Configuring static plugin with:', { assets: staticDir })

  app.use(
    staticPlugin({
      assets: staticDir,
      prefix: '/',
    })
  )

  // Manual static file handler as fallback
  app.get('/assets/*', async ({ params, set }) => {
    try {
      const filePath = `${staticDir}/assets/${params['*']}`
      console.log('Manual static handler for:', filePath)

      const file = Bun.file(filePath)
      const exists = await file.exists()

      if (!exists) {
        console.log('File not found:', filePath)
        set.status = 404
        return 'File not found'
      }

      const fileExtension = filePath.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        js: 'application/javascript',
        css: 'text/css',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
      }

      set.headers = {
        'Content-Type': mimeTypes[fileExtension ?? ''] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      }

      return file
    } catch (error) {
      console.error('Static file serve error:', error)
      set.status = 500
      return 'Internal server error'
    }
  })

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
    console.log(`🌐 Request: ${url.pathname}`)

    // Don't handle API routes
    if (url.pathname.startsWith('/api')) {
      console.log(`🔄 Skipping API route: ${url.pathname}`)
      return
    }

    // Don't handle asset routes - let static plugin handle them
    if (
      url.pathname.startsWith('/assets/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico')
    ) {
      console.log(`📁 Skipping asset route: ${url.pathname}`)
      return // Let static plugin handle these
    }

    try {
      const htmlText = await indexHtml.text()
      console.log(`📄 Serving HTML for: ${url.pathname}`)

      if (ssrRenderWithData || ssrRender) {
        console.log(`⚡ Using SSR for: ${url.pathname}`)
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
        console.log(`📄 Using static HTML for: ${url.pathname}`)
        set.headers = {
          'Content-Type': 'text/html; charset=utf-8',
        }
        return new Response(indexHtml)
      }
    } catch (error) {
      console.error(`❌ SSR error for ${url.pathname}:`, error)
      set.status = 500
      return 'SSR error'
    }
  })
}

// Platform-friendly server startup with comprehensive detection
const startServer = async () => {
  try {
    // Import platform detection
    const { logPlatformInfo, getPlatformBaseUrl } = await import('./lib/platform-detection')

    console.log(`🚀 Starting HackerFolio Server`)
    console.log(`📍 Environment: ${env.NODE_ENV}`)
    console.log(`🔌 Port: ${String(PORT)}`)
    console.log('')

    // Log detailed platform information
    logPlatformInfo()
    console.log('')

    // Log base URL if detected
    const baseUrl = getPlatformBaseUrl()
    if (baseUrl) {
      console.log(`🌐 Base URL: ${baseUrl}`)
    }

    // Start the server
    app.listen({
      port: PORT,
      hostname: '0.0.0.0', // Essential for containerized deployments
    })

    console.log(`✅ Server successfully started on port ${String(PORT)}`)

    // Log CORS origins for debugging
    const corsOrigins = getCorsOrigins()
    console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`)

    // Log important URLs
    console.log('')
    console.log(`📋 Important URLs:`)
    console.log(`   Health Check: http://localhost:${String(PORT)}/api/health`)
    if (baseUrl) {
      console.log(`   Public Health: ${baseUrl}/api/health`)
      console.log(`   Public App: ${baseUrl}/`)
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error')
    process.exit(1)
  }
}

void startServer()
