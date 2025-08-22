// server/app.ts - Simplified main server file
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Elysia, type Context } from 'elysia'

import { orm } from './db/drizzle'
import { env } from './lib/validation'
import { apiLogger } from './middleware/logging'
import { apiRoutes } from './routes/api'
import { terminalRoutes } from './routes/terminal'

const { PORT } = env

// Apply migrations and seed initial data
migrate(orm, { migrationsFolder: 'drizzle' })

const app = new Elysia()
  .use(cors())
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
  let ssrRender: null | ((url: string) => Promise<string>) = null
  let ssrRenderWithData:
    | null
    | ((url: string) => Promise<{ html: string; data: Record<string, unknown> }>) = null
  try {
    // @ts-ignore - SSR bundle may not exist during development
    const ssr = await import('../dist/server/entry-server.js')
    ssrRender = ssr.render as (url: string) => Promise<string>
    ssrRenderWithData = ssr.renderWithData as (
      url: string
    ) => Promise<{ html: string; data: Record<string, unknown> }>
    console.log('SSR renderer loaded')
  } catch {
    console.warn('SSR renderer not found, serving static HTML')
  }

  app.get('*', async ({ request, set }: Context) => {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api')) return
    try {
      const htmlText = await indexHtml.text()
      if (ssrRenderWithData || ssrRender) {
        let appHtml = ''
        let data: Record<string, unknown> | undefined
        if (ssrRenderWithData) {
          const r = await ssrRenderWithData(request.url)
          appHtml = r.html
          data = r.data
        } else if (ssrRender) {
          appHtml = await ssrRender(url.pathname)
        }
        let rendered = htmlText.replace(
          '<div id=\"root\"></div>',
          `<div id=\"root\">${appHtml}</div>`
        )
        if (data && Object.keys(data).length) {
          const script = `\\n<script>window.__INITIAL_DATA__ = ${JSON.stringify(data).replace(/</g, '\\\\u003c')};</script>`
          rendered = rendered.replace('</body>', `${script}\\n</body>`)
        }
        set.headers = { 'Content-Type': 'text/html; charset=utf-8' }
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
console.log(`Elysia server listening on http://localhost:${String(PORT)}`)