// server/app.ts - Simplified main server file
import { cors } from '@elysiajs/cors'
import { Elysia, type Context } from 'elysia'

import { env } from './lib/env'
import { apiLogger } from './middleware/logging'
import { apiRoutes } from './routes/api'
import { terminalRoutes } from './routes/terminal'

const { PORT } = env

// Database is already set up, no migrations needed
console.log('✅ Using existing database')

const app = new Elysia()

app
  .use(
    cors({
      origin: true, // Allow all origins for a portfolio
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(apiLogger)
  .use(apiRoutes)
  .use(terminalRoutes)

// Static file serving for production
app.get('/assets/*', async ({ params, set }) => {
  if (process.env.NODE_ENV !== 'production') {
    set.status = 404
    return 'Not found'
  }

  try {
    // Get static directory
    const STATIC_DIRS = ['./dist/public', './dist'] as const
    let staticDir: (typeof STATIC_DIRS)[number] = './dist/public'

    for (const d of STATIC_DIRS) {
      const f = Bun.file(`${d}/index.html`)
      if (await f.exists()) {
        staticDir = d
        break
      }
    }

    const fileName = params['*']
    const filePath = `${staticDir}/assets/${fileName}`
    const file = Bun.file(filePath)

    if (!(await file.exists())) {
      set.status = 404
      return 'File not found'
    }

    const ext = fileName.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      js: 'application/javascript',
      css: 'text/css',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      eot: 'application/vnd.ms-fontobject',
    }

    const contentType = mimeTypes[ext ?? ''] ?? 'application/octet-stream'

    set.headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    }

    return file
  } catch (error) {
    console.error('Static file error:', error)
    set.status = 500
    return 'Internal server error'
  }
})

// Serve the built client in production
if (process.env.NODE_ENV === 'production') {
  // Get the static directory that was configured earlier
  const STATIC_DIRS = ['./dist/public', './dist'] as const
  let staticDir: (typeof STATIC_DIRS)[number] = './dist/public'

  try {
    for (const d of STATIC_DIRS) {
      const f = Bun.file(`${d}/index.html`)
      // deno-lint-ignore no-await-in-loop
      if (await f.exists()) {
        staticDir = d
        break
      }
    }
  } catch (error) {
    console.error('❌ Static directory detection error:', error)
    staticDir = './dist/public' // explicit fallback
  }

  // SSR render if server bundle exists; fallback to static index.html
  const indexHtml = Bun.file(`${staticDir}/index.html`)
  // Cache HTML content in memory to avoid disk reads per request
  let cachedIndexHtml: string | null = null
  // Type definitions for SSR module
  interface SSRModule {
    render: (url: string) => Promise<string>
    renderWithData: (url: string) => { html: string; data: Record<string, unknown> }
  }

  let ssrRender: null | ((url: string) => Promise<string>) = null
  let ssrRenderWithData: null | ((url: string) => { html: string; data: Record<string, unknown> }) =
    null
  // Try common SSR output locations (prefer dist/server)
  const SSR_CANDIDATES = [
    './dist/server/entry-server.js',
    '../dist/server/entry-server.js',
    './dist/entry-server.js',
    '../dist/entry-server.js',
    './dist/ssr/entry-server.js',
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
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.log(`🌐 Request: ${url.pathname}`)
    }

    // Don't handle API routes
    if (url.pathname.startsWith('/api')) {
      if (process.env.DEBUG === 'true') console.log(`🔄 Skipping API route: ${url.pathname}`)
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
      if (process.env.DEBUG === 'true') console.log(`📁 Skipping asset route: ${url.pathname}`)
      return // Let static plugin handle these
    }

    try {
      cachedIndexHtml ??= await indexHtml.text()
      const htmlText = cachedIndexHtml
      if (process.env.DEBUG === 'true') console.log(`📄 Serving HTML for: ${url.pathname}`)

      if (ssrRenderWithData || ssrRender) {
        if (process.env.DEBUG === 'true') console.log(`⚡ Using SSR for: ${url.pathname}`)
        let appHtml = ''
        let data: Record<string, unknown> | undefined
        const { pathname } = url
        // Try render function first (simpler)
        if (ssrRender) {
          try {
            appHtml = await ssrRender(pathname)
          } catch (error) {
            console.error(`❌ SSR render error:`, error)
            appHtml = '<div>SSR Error</div>'
          }
        } else if (ssrRenderWithData) {
          const { html, data: responseData } = ssrRenderWithData(request.url)
          appHtml = html
          data = responseData
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
