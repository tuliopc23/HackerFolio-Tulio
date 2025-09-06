import { z } from 'zod'

// Environment-specific schemas
const baseEnvSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  APP_URL: z.url().optional(),
  API_URL: z.url().optional(),

  // Database Configuration
  DATABASE_URL: z.string().optional(),
  DB_POOL_MIN: z.coerce.number().min(1).default(2).optional(),
  DB_POOL_MAX: z.coerce.number().min(1).default(10).optional(),

  // External API Integration
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_API_TIMEOUT: z.coerce.number().min(1000).default(30000).optional(),
  GITHUB_CACHE_DURATION: z.coerce.number().min(0).default(300).optional(),

  // Security Configuration
  CORS_ORIGINS: z.string().optional(),
  CSP_REPORT_URI: z.url().optional(),
  CSP_REPORT_ONLY: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(false))
    .optional(),
  RATE_LIMIT_REQUESTS: z.coerce.number().min(1).default(100).optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).default(900000).optional(),
  SESSION_SECRET: z.string().min(32).optional(),

  // Performance & Caching
  STATIC_CACHE_DURATION: z.coerce.number().min(0).default(86400).optional(),
  API_CACHE_ENABLED: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(true))
    .optional(),
  API_CACHE_DURATION: z.coerce.number().min(0).default(300).optional(),

  // Logging & Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'silent']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('pretty'),
  LOG_REQUESTS: z.preprocess(val => val === 'true' || val === true, z.boolean().default(true)),
  SENTRY_DSN: z.url().optional(),

  // Development Configuration
  DEBUG: z.preprocess(val => val === 'true' || val === true, z.boolean().default(false)),
  DEV_WATCH_PATHS: z.string().optional(),
  MOCK_GITHUB_API: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(false))
    .optional(),

  // Build & Deployment
  BUILD_DIR: z.string().default('dist').optional(),
  STATIC_DIR: z.string().default('public').optional(),
  ENABLE_COMPRESSION: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(true))
    .optional(),
  HEALTH_CHECK_ENDPOINT: z.string().default('/health').optional(),
  HEALTH_CHECK_TIMEOUT: z.coerce.number().min(1000).default(5000).optional(),

  // Feature Flags
  FEATURE_GITHUB_INTEGRATION: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(true))
    .optional(),
  FEATURE_TERMINAL_LOGGING: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(true))
    .optional(),
  FEATURE_ANALYTICS: z
    .preprocess(val => val === 'true' || val === true, z.boolean().default(false))
    .optional(),
})

// Development-specific requirements
const developmentEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('development'),
})

// Production-specific requirements (relaxed for PaaS and build time)
const productionEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('production'),
  APP_URL: z.url().optional(), // Optional - will be auto-detected
  API_URL: z.url().optional(), // Optional - will be auto-detected
  SESSION_SECRET: z.string().min(32).optional(), // Optional during build, required at runtime
  CORS_ORIGINS: z.string().optional(), // Optional - will be auto-detected
})

// Test-specific requirements
const testEnvSchema = baseEnvSchema.extend({
  NODE_ENV: z.literal('test'),
})

// Union of all environment schemas with proper fallback
export const envSchema = z.preprocess(
  // Preprocess to set default NODE_ENV if missing
  (data: unknown) => ({
    NODE_ENV: 'development',
    ...(data as Record<string, unknown>),
  }),
  z.discriminatedUnion('NODE_ENV', [developmentEnvSchema, productionEnvSchema, testEnvSchema])
)

export type EnvConfig = z.infer<typeof envSchema>

// Environment validation function
export function validateEnvironment(
  env: Record<string, string | undefined> = process.env
): EnvConfig {
  const result = envSchema.safeParse(env)

  if (!result.success) {
    const errorMessages = result.error.issues.map(issue => {
      const path = issue.path.join('.')
      return `${path}: ${issue.message}`
    })

    throw new Error(
      `Environment validation failed:\\n${errorMessages.join('\\n')}\\n\\n` +
        'Please check your .env file against .env.example for required variables.'
    )
  }

  // Additional runtime validation for production
  const { data } = result
  if (data.NODE_ENV === 'production') {
    // Check if we're in a build context (Vite sets this)
    const isBuildTime =
      (process.env.npm_lifecycle_event?.includes('build') ?? false) ||
      process.argv.some(arg => arg.includes('vite') && arg.includes('build'))

    if (!isBuildTime && !data.SESSION_SECRET) {
      throw new Error(
        'SESSION_SECRET is required for production runtime.\\n\\n' +
          'Please set SESSION_SECRET in your environment variables.'
      )
    }
  }

  return data
}

// Helper functions for environment-specific configurations
export function isDevelopment(env: EnvConfig): boolean {
  return env.NODE_ENV === 'development'
}

export function isProduction(env: EnvConfig): boolean {
  return env.NODE_ENV === 'production'
}

export function isTest(env: EnvConfig): boolean {
  return env.NODE_ENV === 'test'
}

// Parse CORS origins from comma-separated string
export function parseCorsOrigins(corsOrigins?: string): string[] {
  if (!corsOrigins) return ['http://localhost:5173']
  return corsOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
}

// Feature flag helpers
export function isFeatureEnabled(
  env: EnvConfig,
  feature: keyof Pick<
    EnvConfig,
    'FEATURE_GITHUB_INTEGRATION' | 'FEATURE_TERMINAL_LOGGING' | 'FEATURE_ANALYTICS'
  >
): boolean {
  return Boolean(env[feature])
}

// Database configuration helper
export function getDatabaseConfig() {
  return {
    url: './database/portfolio.db',
    poolMin: 2,
    poolMax: 10,
  }
}

// Logging configuration helper
export function getLogConfig(env: EnvConfig) {
  return {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    requests: env.LOG_REQUESTS,
    debug: env.DEBUG,
  }
}

// Security configuration helper
export function getSecurityConfig(env: EnvConfig) {
  return {
    corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
    sessionSecret: env.SESSION_SECRET,
    rateLimiting: {
      requests: env.RATE_LIMIT_REQUESTS ?? 100,
      windowMs: env.RATE_LIMIT_WINDOW_MS ?? 900000,
    },
    csp: {
      reportUri: env.CSP_REPORT_URI,
      reportOnly: env.CSP_REPORT_ONLY ?? false,
    },
  }
}

// Cache configuration helper
export function getCacheConfig(env: EnvConfig) {
  return {
    api: {
      enabled: env.API_CACHE_ENABLED ?? true,
      duration: env.API_CACHE_DURATION ?? 300,
    },
    static: {
      duration: env.STATIC_CACHE_DURATION ?? 86400,
    },
  }
}

// External API configuration helper
export function getExternalApiConfig(env: EnvConfig) {
  return {
    github: {
      token: env.GITHUB_TOKEN,
      timeout: env.GITHUB_API_TIMEOUT ?? 30000,
      cacheDuration: env.GITHUB_CACHE_DURATION ?? 300,
      mockInDev: env.MOCK_GITHUB_API ?? false,
    },
  }
}

// Validate and export environment configuration
export const env = validateEnvironment()

// Export individual configurations for easy use
export const dbConfig = getDatabaseConfig()
export const logConfig = getLogConfig(env)
export const securityConfig = getSecurityConfig(env)
export const cacheConfig = getCacheConfig(env)
export const externalApiConfig = getExternalApiConfig(env)
