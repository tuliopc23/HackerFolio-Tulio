import { redirect } from '@tanstack/react-router'

/**
 * Route guard types and utilities
 */
export interface RouteGuardContext {
  pathname: string
  search: Record<string, unknown>
  params: Record<string, unknown>
}

export type RouteGuard = (context: RouteGuardContext) => boolean | Promise<boolean>

/**
 * Rate limiting for route access
 */
class RouteRateLimiter {
  private accessCounts = new Map<string, { count: number; resetTime: number }>()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(route: string, identifier = 'default'): boolean {
    const key = `${route}:${identifier}`
    const now = Date.now()
    const record = this.accessCounts.get(key)

    if (!record || now > record.resetTime) {
      this.accessCounts.set(key, { count: 1, resetTime: now + this.windowMs })
      return true
    }

    if (record.count >= this.maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  reset(route?: string, identifier = 'default') {
    if (route) {
      const key = `${route}:${identifier}`
      this.accessCounts.delete(key)
    } else {
      this.accessCounts.clear()
    }
  }
}

/**
 * Global rate limiter instance
 */
export const routeRateLimiter = new RouteRateLimiter()

/**
 * Security headers middleware
 */
// Note: Security headers must be set by the server, not via meta tags.
// This function is intentionally a no-op to avoid client-side CSP/XFO injection
// that conflicts with dev/prod policies and causes browser console warnings.
export function addSecurityHeaders() {
  // Security headers must be set by the server, not via meta tags.
  // This function is intentionally a no-op to avoid client-side CSP/XFO injection
  // that conflicts with dev/prod policies and causes browser console warnings.
}

/**
 * Route access logger
 */
export function logRouteAccess(route: string, context: RouteGuardContext) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[Route Access] ${route}`, {
      pathname: context.pathname,
      search: context.search,
      params: context.params,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Validate route parameters
 */
export function validateRouteParams(
  params: Record<string, unknown>,
  schema: Record<string, (value: unknown) => boolean>
): boolean {
  for (const [key, validator] of Object.entries(schema)) {
    if (params[key] !== undefined && !validator(params[key])) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid route parameter: ${key} = ${JSON.stringify(params[key])}`)
      return false
    }
  }
  return true
}

/**
 * Common route guards
 */
export const routeGuards = {
  /**
   * Rate limiting guard
   */
  rateLimit: (maxAttempts = 10, windowMs = 60000): RouteGuard => {
    const limiter = new RouteRateLimiter(maxAttempts, windowMs)
    return context => {
      const identifier = 'user' // Could be IP or user ID in real app
      return limiter.isAllowed(context.pathname, identifier)
    }
  },

  /**
   * Development only guard
   */
  devOnly: (): RouteGuard => {
    return () => import.meta.env.DEV
  },

  /**
   * Parameter validation guard
   */
  validateParams: (schema: Record<string, (value: unknown) => boolean>): RouteGuard => {
    return context => validateRouteParams(context.params, schema)
  },

  /**
   * Maintenance mode guard
   */
  maintenanceMode: (): RouteGuard => {
    return () => {
      // Check if maintenance mode is enabled
      const maintenanceMode = localStorage.getItem('maintenance-mode') === 'true'
      return !maintenanceMode
    }
  },

  /**
   * Feature flag guard
   */
  featureFlag: (flagName: string): RouteGuard => {
    return () => {
      // Check if feature is enabled
      const flags = JSON.parse(localStorage.getItem('feature-flags') ?? '{}') as Record<
        string,
        boolean
      >
      return flags[flagName] === true
    }
  },
}

/**
 * Route middleware runner
 */
export async function runRouteGuards(
  guards: RouteGuard[],
  context: RouteGuardContext
): Promise<boolean> {
  for (const guard of guards) {
    try {
      const result = await guard(context)
      if (!result) {
        return false
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Route guard error:', error)
      return false
    }
  }
  return true
}

/**
 * Create a beforeLoad function with guards
 */
export function createRouteGuard(guards: RouteGuard[]) {
  return async ({
    location,
  }: {
    location: {
      pathname: string
      search: Record<string, unknown>
      params?: Record<string, unknown>
    }
  }) => {
    const context: RouteGuardContext = {
      pathname: location.pathname,
      search: location.search,
      params: location.params ?? {},
    }

    // Log route access
    logRouteAccess(location.pathname, context)

    // Security headers are applied by the server; avoid client meta injection

    // Run guards
    const allowed = await runRouteGuards(guards, context)

    if (!allowed) {
      // Redirect to home or show error
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/',
        search: {
          error: 'access-denied',
          from: location.pathname,
        },
      })
    }
  }
}

/**
 * Analytics and performance tracking
 */
export function trackRoutePerformance(route: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigationStart = performance.now()
    const loadTime = performance.now() - navigationStart

    // Log performance metrics
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Route Performance] ${route}: ${loadTime.toFixed(2)}ms`)
    }

    // Could send to analytics service here
    // analytics.track('route_load_time', { route, loadTime })
  }
}
