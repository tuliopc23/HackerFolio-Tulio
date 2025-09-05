import type { Context } from 'elysia'

import { env } from './env-config'
import { getPlatformCorsOrigins } from './platform-detection'

// Rate limiting store - in production, use Redis or similar
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000
)

/**
 * Security headers configuration
 */
export const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for React
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: https: images.unsplash.com",
    "connect-src 'self' api.github.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

/**
 * Security headers for development (more permissive)
 */
export const devSecurityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* 127.0.0.1:*",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: https: http: localhost:* 127.0.0.1:*",
    "connect-src 'self' ws: wss: localhost:* 127.0.0.1:* api.github.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
  ].join('; '),
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(context: Context): void {
  const headers = env.NODE_ENV === 'development' ? devSecurityHeaders : securityHeaders

  for (const [key, value] of Object.entries(headers)) {
    context.set.headers[key] = value
  }

  // Add HSTS only in production with HTTPS
  if (env.NODE_ENV === 'production') {
    context.set.headers['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains; preload'
  }
}

/**
 * Rate limiting configuration
 */
export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Default rate limit options
 */
export const defaultRateLimitOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

/**
 * API-specific rate limiting (stricter)
 */
export const apiRateLimitOptions: RateLimitOptions = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50, // 50 requests per 5 minutes
  message: 'API rate limit exceeded, please try again later',
}

/**
 * Terminal command rate limiting (very permissive for UX)
 */
export const terminalRateLimitOptions: RateLimitOptions = {
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30, // 30 commands per minute
  message: 'Command rate limit exceeded, please slow down',
}

/**
 * Get client identifier for rate limiting
 */
export function getClientId(context: Context): string {
  // In production, consider using a more sophisticated approach
  const forwarded = context.request.headers.get('x-forwarded-for')
  const ip =
    forwarded?.split(',')[0]?.trim() ?? context.request.headers.get('x-real-ip') ?? 'unknown'

  // Add user agent for additional uniqueness
  const userAgent = context.request.headers.get('user-agent') ?? ''
  const userAgentHash = userAgent ? btoa(userAgent).slice(0, 8) : 'none'

  return `${ip}-${userAgentHash}`
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = defaultRateLimitOptions) {
  return function (context: Context): boolean {
    const clientId = getClientId(context)
    const now = Date.now()

    // Get or create rate limit entry
    let entry = rateLimitStore.get(clientId)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + options.windowMs,
      }
      rateLimitStore.set(clientId, entry)

      // Set rate limit headers for new/reset entries
      context.set.headers['X-RateLimit-Limit'] = options.maxRequests.toString()
      context.set.headers['X-RateLimit-Remaining'] = (options.maxRequests - entry.count).toString()
      context.set.headers['X-RateLimit-Reset'] = entry.resetTime.toString()

      return true // Allow request
    }

    if (entry.count >= options.maxRequests) {
      // Rate limit exceeded
      context.set.status = 429
      context.set.headers['Retry-After'] = Math.ceil((entry.resetTime - now) / 1000).toString()
      context.set.headers['X-RateLimit-Limit'] = options.maxRequests.toString()
      context.set.headers['X-RateLimit-Remaining'] = '0'
      context.set.headers['X-RateLimit-Reset'] = entry.resetTime.toString()

      return false // Block request
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(clientId, entry)

    // Add rate limit headers
    context.set.headers['X-RateLimit-Limit'] = options.maxRequests.toString()
    context.set.headers['X-RateLimit-Remaining'] = (options.maxRequests - entry.count).toString()
    context.set.headers['X-RateLimit-Reset'] = entry.resetTime.toString()

    return true // Allow request
  }
}

/**
 * Input sanitization utilities
 */
export const InputSanitizer = {
  /**
   * Sanitize string input by removing potentially dangerous characters
   */
  sanitizeString(input: string, maxLength = 1000): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string')
    }

    return (
      input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>"'&]/g, '') // Remove basic XSS characters
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    ) // Remove control characters
  },

  /**
   * Sanitize command input for terminal
   */
  sanitizeCommand(command: string): string {
    if (typeof command !== 'string') {
      throw new Error('Command must be a string')
    }

    return (
      command
        .trim()
        .slice(0, 200) // Reasonable command length limit
        .replace(/[;&|`$(){}[\]\\]/g, '') // Remove shell metacharacters
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ')
    ) // Normalize whitespace
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },

  /**
   * Sanitize URL input
   */
  sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      throw new Error('URL must be a string')
    }

    try {
      const parsed = new URL(url)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
      return parsed.toString()
    } catch {
      throw new Error('Invalid URL format')
    }
  },

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  },

  /**
   * Sanitize file path to prevent directory traversal
   */
  sanitizePath(path: string): string {
    return path
      .replace(/\.\./g, '') // Remove parent directory references
      .replace(/[^a-zA-Z0-9._/-]/g, '') // Allow only safe characters
      .replace(/\/+/g, '/') // Normalize slashes
      .slice(0, 255) // Reasonable path length limit
  },
}

/**
 * CORS configuration - PaaS-friendly with comprehensive platform detection
 */
export function getCorsOrigins(): string[] {
  return getPlatformCorsOrigins()
}

/**
 * Security audit logging
 */
export interface SecurityEvent {
  type: 'rate_limit' | 'invalid_input' | 'suspicious_request' | 'cors_violation'
  clientId: string
  timestamp: number
  details: Record<string, unknown>
}

const securityEvents: SecurityEvent[] = []

export const SecurityLogger = {
  log(event: SecurityEvent): void {
    securityEvents.push(event)

    // Keep only last 1000 events in memory
    if (securityEvents.length > 1000) {
      securityEvents.shift()
    }

    // In production, send to external logging service
    if (env.NODE_ENV === 'production') {
      console.error('[SECURITY]', JSON.stringify(event))
    }
  },

  getEvents(): SecurityEvent[] {
    return [...securityEvents]
  },

  clearEvents(): void {
    securityEvents.length = 0
  },

  getRecentEvents(limit = 50): SecurityEvent[] {
    return securityEvents.slice(-limit)
  },

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return securityEvents.filter(event => event.type === type)
  },
}
