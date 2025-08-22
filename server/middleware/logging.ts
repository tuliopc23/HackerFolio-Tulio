import { Elysia, type Context } from 'elysia'

// Logging middleware for API routes
export const apiLogger = new Elysia()
  .onBeforeHandle(({ set }: Context) => {
    // Mark start time for simple duration measurement
    set.headers['x-start-time'] = String(Date.now())
  })
  .onAfterHandle(({ request, set }: Context) => {
    const startHeader = request.headers.get('x-start-time')
    const started = startHeader ? Number(startHeader) : undefined
    const duration = started ? Date.now() - started : 0
    const url = new URL(request.url)
    
    if (url.pathname.startsWith('/api')) {
      const time = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit', 
        second: '2-digit',
        hour12: true,
      })
      const line = `${time} [elysia] ${request.method} ${url.pathname} ${Number(set.status) ?? 200} in ${String(duration)}ms`
      console.log(line)
    }
  })