// Simple security utilities for portfolio app

/**
 * Basic security headers for production
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

/**
 * Apply basic security headers in production
 */
export function applySecurityHeaders(context: { set: { headers: Record<string, string> } }) {
  if (process.env.NODE_ENV === 'production') {
    Object.assign(context.set.headers, securityHeaders)
  }
}
