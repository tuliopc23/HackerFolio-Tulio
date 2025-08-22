import { Elysia, type Context } from 'elysia'

// Logging middleware for API routes
export const apiLogger = new Elysia()
  .onBeforeHandle(({ set }: Context) => {
    // Mark start time for simple duration measurement
    set.headers['x-start-time'] = String(Date.now())
  })
  .onAfterHandle(({ request, set: _set }: Context) => {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api')) {
      // Logging would happen here in production
    }
  })
