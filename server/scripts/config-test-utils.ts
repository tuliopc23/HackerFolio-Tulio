#!/usr/bin/env bun
/**
 * Configuration Testing Utilities
 * 
 * This module provides utilities for testing configuration across different environments
 * without ES module caching issues.
 */

import { z } from 'zod'

// Copy of the environment schema to avoid module dependencies
const testEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  APP_URL: z.string().url().optional(),
  API_URL: z.string().url().optional(),
  DATABASE_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  CORS_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'silent']).default('info'),
  MOCK_GITHUB_API: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(false)
  ).optional(),
  DEBUG: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(false)
  ),
})

export type TestEnvConfig = z.infer<typeof testEnvSchema>

/**
 * Create an isolated configuration instance for testing
 */
export function createTestConfig(envVars: Record<string, string>) {
  const env = testEnvSchema.parse(envVars)
  
  const isDev = env.NODE_ENV === 'development'
  const isProd = env.NODE_ENV === 'production'
  const isTest = env.NODE_ENV === 'test'

  return {
    app: {
      name: 'hackerfolio-tulio',
      version: '0.1.0',
      environment: env.NODE_ENV,
      port: env.PORT,
      ...(env.APP_URL && { baseUrl: env.APP_URL }),
      ...(env.API_URL && { apiUrl: env.API_URL }),
    },

    build: {
      clientOutDir: 'dist/public',
      serverOutDir: 'dist/server',
      staticDir: 'public',
      assetsDir: 'assets',
      sourcemap: isDev || isTest,
      minify: isProd,
      emptyOutDir: true,
    },

    development: {
      hmr: isDev,
      proxyPort: env.PORT,
      watchPaths: ['./shared', './server/lib'],
      mockApis: env.MOCK_GITHUB_API || false,
      devServerHost: '0.0.0.0',
    },

    database: {
      url: env.DATABASE_URL || './database/portfolio.db',
      dialect: 'sqlite' as const,
      migrations: {
        directory: './drizzle',
        tableName: '__drizzle_migrations',
      },
      pool: {
        min: 2,
        max: 10,
      },
    },

    security: {
      corsOrigins: env.CORS_ORIGINS?.split(',').map(o => o.trim()) || 
                   (isDev ? ['http://localhost:5173'] : []),
      sessionSecret: env.SESSION_SECRET,
      rateLimiting: {
        requests: 100,
        windowMs: 900000,
      },
      headers: {
        hsts: isProd,
      },
    },

    tools: {
      typescript: {
        baseUrl: '.',
        paths: {
          '@/*': ['./client/src/*'],
          '@shared/*': ['./shared/*'],
          '@server/*': ['./server/*'],
        },
        outDir: './dist',
      },
    },

    features: {
      githubIntegration: true,
      terminalLogging: true,
      analytics: false,
      ssr: isProd,
    },

    external: {
      github: {
        timeout: 30000,
        cacheDuration: 300,
        mockInDev: env.MOCK_GITHUB_API || false,
      },
    },

    // Helper methods
    get(section: string) {
      return (this as any)[section]
    },

    isDevelopment: () => isDev,
    isProduction: () => isProd,
    isTest: () => isTest,
  }
}

/**
 * Test environment configurations
 */
export const testEnvironments = {
  development: {
    NODE_ENV: 'development',
    PORT: '3001',
    DEBUG: 'true',
    LOG_LEVEL: 'debug'
  },
  
  production: {
    NODE_ENV: 'production',
    PORT: '3001',
    APP_URL: 'https://example.com',
    API_URL: 'https://api.example.com',
    SESSION_SECRET: 'test-secret-key-32-characters-long',
    CORS_ORIGINS: 'https://example.com,https://www.example.com',
    LOG_LEVEL: 'info'
  },
  
  test: {
    NODE_ENV: 'test',
    PORT: '3001',
    LOG_LEVEL: 'silent',
    DATABASE_URL: ':memory:',
    MOCK_GITHUB_API: 'true'
  }
}

export default { createTestConfig, testEnvironments }