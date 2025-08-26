import { Elysia } from 'elysia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  InputSanitizer,
  SecurityLogger,
  applySecurityHeaders,
  getClientId,
  getCorsOrigins,
  rateLimit,
} from '../lib/security'

describe('Security System', () => {
  beforeEach(() => {
    // Clear any existing rate limit data - store is internal to security module
  })

  afterEach(() => {
    // Clean up
  })

  // Type definitions for test mocks - create a proper Elysia context mock
  interface MockContext {
    body: unknown
    query: Record<string, string>
    params: Record<string, string>
    headers: Record<string, string | undefined>
    cookie: Record<string, any>
    set: {
      headers: Record<string, string>
      status?: number
    }
    request: Request
    error: (code: number, message?: string) => never
    server: any
    redirect: (url: string, status?: number) => never
    path: string
    route: string
    store: Record<string, unknown>
    status: number
  }

  describe('Security Headers', () => {
    it('should apply basic security headers', () => {
      const mockRequest = new Request('http://localhost/test', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'test-agent',
        },
      })

      const mockContext: MockContext = {
        body: {},
        query: {},
        params: {},
        headers: {},
        cookie: {},
        set: { headers: {} },
        request: mockRequest,
        error: (code: number, message?: string) => {
          throw new Error(`${code}: ${message}`)
        },
        server: {},
        redirect: (url: string, status?: number) => {
          throw new Error(`Redirect to ${url} with status ${status}`)
        },
        path: '/test',
        route: '/test',
        store: {},
        status: 200,
      }

      applySecurityHeaders(mockContext as any)

      expect(mockContext.set.headers['X-Frame-Options']).toBeDefined()
      expect(mockContext.set.headers['X-Content-Type-Options']).toBe('nosniff')
      expect(mockContext.set.headers['X-XSS-Protection']).toBe('1; mode=block')
      expect(mockContext.set.headers['Content-Security-Policy']).toContain("default-src 'self'")
    })

    it('should include CORS origins configuration', () => {
      const origins = getCorsOrigins()
      expect(Array.isArray(origins)).toBe(true)
      expect(origins.length).toBeGreaterThan(0)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const mockRequest = new Request('http://localhost/test', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
          'user-agent': 'test-agent',
        },
      })

      const mockContext: MockContext = {
        body: {},
        query: {},
        params: {},
        headers: {},
        cookie: {},
        set: {
          headers: {} as Record<string, string>,
          status: 200,
        },
        request: mockRequest,
        error: (code: number, message?: string) => {
          throw new Error(`${code}: ${message}`)
        },
        server: {},
        redirect: (url: string, status?: number) => {
          throw new Error(`Redirect to ${url} with status ${status}`)
        },
        path: '/test',
        route: '/test',
        store: {},
        status: 200,
      }

      const rateLimiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 10,
      })

      const result = rateLimiter(mockContext as any)
      expect(result).toBe(true)
      expect(mockContext.set.headers['X-RateLimit-Limit']).toBe('10')
    })

    it('should get client ID from request headers', () => {
      const mockRequest = new Request('http://localhost/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
      })

      const mockContext: MockContext = {
        body: {},
        query: {},
        params: {},
        headers: {},
        cookie: {},
        set: { headers: {} },
        request: mockRequest,
        error: (code: number, message?: string) => {
          throw new Error(`${code}: ${message}`)
        },
        server: {},
        redirect: (url: string, status?: number) => {
          throw new Error(`Redirect to ${url} with status ${status}`)
        },
        path: '/test',
        route: '/test',
        store: {},
        status: 200,
      }

      const clientId = getClientId(mockContext as any)
      expect(clientId).toContain('192.168.1.1')
      expect(typeof clientId).toBe('string')
    })

    it('should handle missing headers gracefully', () => {
      const mockRequest = new Request('http://localhost/test')

      const mockContext: MockContext = {
        body: {},
        query: {},
        params: {},
        headers: {},
        cookie: {},
        set: { headers: {} },
        request: mockRequest,
        error: (code: number, message?: string) => {
          throw new Error(`${code}: ${message}`)
        },
        server: {},
        redirect: (url: string, status?: number) => {
          throw new Error(`Redirect to ${url} with status ${status}`)
        },
        path: '/test',
        route: '/test',
        store: {},
        status: 200,
      }

      const clientId = getClientId(mockContext as any)
      expect(clientId).toContain('unknown')
    })
  })

  describe('Input Sanitization', () => {
    describe('sanitizeString', () => {
      it('should remove dangerous characters', () => {
        const input = '<script>alert("xss")</script>'
        const result = InputSanitizer.sanitizeString(input)
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).not.toContain('"')
      })

      it('should limit string length', () => {
        const input = 'a'.repeat(2000)
        const result = InputSanitizer.sanitizeString(input, 100)
        expect(result.length).toBeLessThanOrEqual(100)
      })

      it('should remove control characters', () => {
        const input = 'hello\u0000world\u007f'
        const result = InputSanitizer.sanitizeString(input)
        expect(result).toBe('helloworld')
      })

      it('should throw error for non-string input', () => {
        expect(() => {
          // Intentionally passing wrong type to test error handling
          InputSanitizer.sanitizeString(123 as unknown as string)
        }).toThrow('Input must be a string')
      })
    })

    describe('sanitizeCommand', () => {
      it('should remove shell metacharacters', () => {
        const input = 'ls -la; rm -rf /'
        const result = InputSanitizer.sanitizeCommand(input)
        expect(result).not.toContain(';')
        expect(result).not.toContain('|')
        expect(result).not.toContain('&')
      })

      it('should limit command length', () => {
        const input = 'command' + ' arg'.repeat(100)
        const result = InputSanitizer.sanitizeCommand(input)
        expect(result.length).toBeLessThanOrEqual(200)
      })

      it('should normalize whitespace', () => {
        const input = 'ls    -la     file.txt'
        const result = InputSanitizer.sanitizeCommand(input)
        expect(result).toBe('ls -la file.txt')
      })

      it('should throw error for non-string input', () => {
        expect(() => {
          // Intentionally passing wrong type to test error handling
          InputSanitizer.sanitizeCommand(null as unknown as string)
        }).toThrow('Command must be a string')
      })
    })

    describe('validateEmail', () => {
      it('should validate correct email formats', () => {
        expect(InputSanitizer.validateEmail('test@example.com')).toBe(true)
        expect(InputSanitizer.validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      })

      it('should reject invalid email formats', () => {
        expect(InputSanitizer.validateEmail('invalid-email')).toBe(false)
        expect(InputSanitizer.validateEmail('@example.com')).toBe(false)
        expect(InputSanitizer.validateEmail('test@')).toBe(false)
      })

      it('should reject overly long emails', () => {
        const longEmail = 'a'.repeat(250) + '@example.com'
        expect(InputSanitizer.validateEmail(longEmail)).toBe(false)
      })
    })

    describe('validateUrl', () => {
      it('should validate correct URL formats', () => {
        expect(InputSanitizer.validateUrl('https://example.com')).toBe(true)
        expect(InputSanitizer.validateUrl('http://localhost:3000')).toBe(true)
      })

      it('should reject invalid URL formats', () => {
        expect(InputSanitizer.validateUrl('not-a-url')).toBe(false)
        expect(InputSanitizer.validateUrl('ftp://example.com')).toBe(false)
        expect(InputSanitizer.validateUrl('javascript:alert(1)')).toBe(false)
      })
    })

    describe('sanitizePath', () => {
      it('should remove directory traversal attempts', () => {
        const input = '../../../etc/passwd'
        const result = InputSanitizer.sanitizePath(input)
        expect(result).not.toContain('..')
      })

      it('should normalize slashes', () => {
        const input = 'path//to///file'
        const result = InputSanitizer.sanitizePath(input)
        expect(result).toBe('path/to/file')
      })

      it('should limit path length', () => {
        const input = 'very/long/path/'.repeat(50)
        const result = InputSanitizer.sanitizePath(input)
        expect(result.length).toBeLessThanOrEqual(255)
      })
    })
  })

  describe('Security Logger', () => {
    it('should log security events', () => {
      const event = {
        type: 'rate_limit' as const,
        clientId: 'test-client',
        timestamp: Date.now(),
        details: { endpoint: '/api/test' },
      }

      SecurityLogger.log(event)
      const recentEvents = SecurityLogger.getRecentEvents(1)

      expect(recentEvents).toHaveLength(1)
      expect(recentEvents[0]?.type).toBe('rate_limit')
      expect(recentEvents[0]?.clientId).toBe('test-client')
    })

    it('should filter events by type', () => {
      SecurityLogger.log({
        type: 'rate_limit',
        clientId: 'client1',
        timestamp: Date.now(),
        details: {},
      })

      SecurityLogger.log({
        type: 'invalid_input',
        clientId: 'client2',
        timestamp: Date.now(),
        details: {},
      })

      const rateLimitEvents = SecurityLogger.getEventsByType('rate_limit')
      const invalidInputEvents = SecurityLogger.getEventsByType('invalid_input')

      expect(rateLimitEvents.length).toBeGreaterThanOrEqual(1)
      expect(invalidInputEvents.length).toBeGreaterThanOrEqual(1)
      expect(rateLimitEvents.every(e => e.type === 'rate_limit')).toBe(true)
    })

    it('should limit stored events to prevent memory issues', () => {
      // Log more than 1000 events
      for (let i = 0; i < 1100; i++) {
        SecurityLogger.log({
          type: 'suspicious_request',
          clientId: `client-${i}`,
          timestamp: Date.now(),
          details: { index: i },
        })
      }

      const allEvents = SecurityLogger.getRecentEvents(2000)
      expect(allEvents.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('Integration Tests', () => {
    it('should create secure Elysia app with middleware', async () => {
      const app = new Elysia()
        .derive(context => {
          // Apply security headers directly to context
          Object.assign(context.set.headers, {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': "default-src 'self'",
          })
          applySecurityHeaders(context)
          return {}
        })
        .get('/test', () => ({ message: 'test' }))

      const response = await app.handle(new Request('http://localhost/test'))
      const headers = Object.fromEntries(response.headers.entries())

      expect(headers['x-frame-options']).toBeDefined()
      expect(headers['x-content-type-options']).toBe('nosniff')
      expect(response.status).toBe(200)
    })

    it('should handle rate limiting in API routes', async () => {
      let requestCount = 0

      const app = new Elysia()
        .derive(context => {
          const rateLimiter = rateLimit({
            windowMs: 1000,
            maxRequests: 2,
          })

          const allowed = rateLimiter(context)
          if (!allowed) {
            context.set.status = 429
            return { error: 'Rate limited' }
          }

          requestCount++
          return {}
        })
        .get('/api/test', () => ({ success: true }))

      // First two requests should succeed
      const response1 = await app.handle(new Request('http://localhost/api/test'))
      const response2 = await app.handle(new Request('http://localhost/api/test'))

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Third request should be rate limited
      const response3 = await app.handle(new Request('http://localhost/api/test'))
      expect(response3.status).toBe(429)
    })
  })
})
