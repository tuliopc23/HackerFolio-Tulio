import { cors } from '@elysiajs/cors'
import { Elysia, type Context } from 'elysia'

import { env } from './lib/env'
import { apiLogger } from './middleware/logging'
import { apiRoutes } from './routes/api'
import { terminalRoutes } from './routes/terminal'

const { PORT } = env

const STATIC_DIRS = ['./dist/public', './dist'] as const
let resolvedStaticDir: (typeof STATIC_DIRS)[number] | null = null

async function getStaticDir() {
  if (resolvedStaticDir) return resolvedStaticDir

  console.log('🔍 Resolving static directory...')
  for (const d of STATIC_DIRS) {
    const f = Bun.file(`${d}/index.html`)
    // deno-lint-ignore no-await-in-loop
    if (await f.exists()) {
      console.log(`✅ Found static files in: ${d}`)
      resolvedStaticDir = d
      break
    } else {
      console.log(`❌ Not found: ${d}/index.html`)
    }
  }

  // Fallback to default even if not found to avoid returning undefined
  resolvedStaticDir ??= './dist/public'
  console.log(`📁 Using static directory: ${resolvedStaticDir}`)
  return resolvedStaticDir
}

function getAssetHeaders(extension: string | undefined) {
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
    webmanifest: 'application/manifest+json',
    map: 'application/json',
    txt: 'text/plain; charset=utf-8',
  }

  const contentType = mimeTypes[extension ?? ''] ?? 'application/octet-stream'
  return {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
  }
}

async function resolveAsset(fileKey: string) {
  const sanitizedName = decodeURIComponent(fileKey).split('?')[0]?.trim()
  if (!sanitizedName) return null

  const staticDir = await getStaticDir()
  const filePath = `${staticDir}/assets/${sanitizedName}`
  const file = Bun.file(filePath)

  if (!(await file.exists())) return null

  const ext = sanitizedName.split('.').pop()?.toLowerCase()
  const headers = getAssetHeaders(ext)

  return { file, headers }
}

async function buildPublicFileResponse(filePathRelative: string, method: string) {
  try {
    const staticDir = await getStaticDir()
    const filePath = `${staticDir}/${filePathRelative}`
    const file = Bun.file(filePath)
    if (!(await file.exists())) {
      return new Response('Not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
    const ext = filePathRelative.split('.').pop()?.toLowerCase()
    const headers = getAssetHeaders(ext)
    if (method === 'HEAD') return new Response(null, { status: 200, headers })
    return new Response(file, { headers })
  } catch (e) {
    console.error('Public file serve error:', e)
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function buildAssetResponse(fileKey: string, method: string) {
  try {
    const asset = await resolveAsset(fileKey)

    if (!asset) {
      return new Response('File not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    if (method === 'HEAD') {
      return new Response(null, { status: 200, headers: asset.headers })
    }

    return new Response(asset.file, { headers: asset.headers })
  } catch (e) {
    console.error('Asset serve error:', e)
    return new Response('File not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

const app = new Elysia()

app
  .onRequest(async ({ request }) => {
    if (request.method !== 'HEAD') return undefined

    const url = new URL(request.url)

    if (url.pathname.startsWith('/assets/')) {
      const fileKey = url.pathname.slice('/assets/'.length)
      return await buildAssetResponse(fileKey, 'HEAD')
    }

    if (process.env.NODE_ENV === 'production' && !url.pathname.startsWith('/api')) {
      const indexHtml = Bun.file(`${await getStaticDir()}/index.html`)
      if (!(await indexHtml.exists())) {
        return new Response(null, { status: 404 })
      }
      return new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new Response(null, { status: 200 })
  })
  .use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(apiLogger)
  .use(apiRoutes)
  .use(terminalRoutes)

// Static file serving for production
app.get('/assets/*', async ({ params, request }) => {
  const assetPath = params['*']
  console.log(`📦 Asset request: /assets/${assetPath}`)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`⚠️  Rejecting asset request (not in production mode)`)
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  try {
    const response = await buildAssetResponse(assetPath, request.method)
    console.log(`✅ Asset served: /assets/${assetPath} (${response.status})`)
    return response
  } catch (error) {
    console.error(`❌ Static file error for /assets/${assetPath}:`, error)
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
})

// Public root assets (favicon, manifest, sw)
app.get('/favicon.ico', ({ request }) => buildPublicFileResponse('favicon.ico', request.method))
app.get('/favicon.svg', ({ request }) => buildPublicFileResponse('favicon.svg', request.method))
app.get('/site.webmanifest', ({ request }) =>
  buildPublicFileResponse('site.webmanifest', request.method)
)
app.get('/sw.js', ({ request }) => buildPublicFileResponse('sw.js', request.method))

// Serve the built client in production
if (process.env.NODE_ENV === 'production') {
  // SSR render if server bundle exists; fallback to static index.html
  const indexHtml = Bun.file(`${await getStaticDir()}/index.html`)
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

  app.get('*', async ({ request }: Context) => {
    const url = new URL(request.url)
    const isHeadRequest = request.method === 'HEAD'

    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.log(`🌐 Request: ${url.pathname}`)
    }

    // Don't handle API routes
    if (url.pathname.startsWith('/api')) {
      if (process.env.DEBUG === 'true') console.log(`🔄 Skipping API route: ${url.pathname}`)
      return new Response(null, { status: 404 })
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
      return new Response(null, { status: 404 })
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
        const headers = { 'Content-Type': 'text/html; charset=utf-8' }
        if (isHeadRequest) {
          return new Response(null, { status: 200, headers })
        }
        return new Response(rendered, { status: 200, headers })
      } else {
        console.log(`📄 Using static HTML for: ${url.pathname}`)
        const headers = { 'Content-Type': 'text/html; charset=utf-8' }
        if (isHeadRequest) {
          return new Response(null, { status: 200, headers })
        }
        return new Response(htmlText, { status: 200, headers })
      }
    } catch (error) {
      console.error(`❌ SSR error for ${url.pathname}:`, error)
      return new Response('SSR error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
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
