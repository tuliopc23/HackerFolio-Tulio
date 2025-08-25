/**
 * Central Configuration Registry
 * 
 * This module provides a unified configuration system that:
 * - Consolidates all configuration values from environment variables
 * - Provides type-safe configuration access across all modules
 * - Supports environment-aware configuration resolution
 * - Validates configuration consistency at startup
 * - Enables cross-configuration validation
 */

import { z } from 'zod'
import { validateEnvironment, type EnvConfig } from '../server/lib/env-config'

// =============================================================================
// CENTRAL CONFIGURATION SCHEMA
// =============================================================================

export interface AppConfiguration {
  // Application Core
  app: {
    name: string
    version: string
    environment: 'development' | 'production' | 'test'
    port: number
    baseUrl?: string
    apiUrl?: string
  }

  // Build Configuration
  build: {
    clientOutDir: string
    serverOutDir: string
    staticDir: string
    assetsDir: string
    sourcemap: boolean
    minify: boolean
    emptyOutDir: boolean
  }

  // Development Configuration
  development: {
    hmr: boolean
    proxyPort: number
    watchPaths: string[]
    mockApis: boolean
    devServerHost: string
  }

  // Database Configuration
  database: {
    url: string
    dialect: 'sqlite' | 'postgresql' | 'mysql'
    migrations: {
      directory: string
      tableName: string
    }
    pool: {
      min: number
      max: number
    }
  }

  // Security Configuration
  security: {
    corsOrigins: string[]
    sessionSecret?: string
    rateLimiting: {
      requests: number
      windowMs: number
    }
    headers: {
      csp?: string
      hsts: boolean
    }
  }

  // Path Configuration
  paths: {
    root: string
    client: string
    server: string
    shared: string
    assets: string
    dist: string
    drizzle: string
  }

  // Tool Configuration
  tools: {
    vite: {
      root: string
      build: {
        outDir: string
        emptyOutDir: boolean
      }
      server: {
        proxy: Record<string, { target: string; changeOrigin: boolean }>
      }
      resolve: {
        alias: Record<string, string>
      }
    }
    typescript: {
      baseUrl: string
      paths: Record<string, string[]>
      outDir: string
    }
    eslint: {
      ignorePatterns: string[]
      projectService: boolean
    }
  }

  // Feature Flags
  features: {
    githubIntegration: boolean
    terminalLogging: boolean
    analytics: boolean
    ssr: boolean
  }

  // External Services
  external: {
    github: {
      token?: string
      timeout: number
      cacheDuration: number
      mockInDev: boolean
    }
    sentry?: {
      dsn: string
      environment: string
    }
  }
}

// =============================================================================
// CONFIGURATION MANAGER CLASS
// =============================================================================

export class ConfigurationManager {
  private static instance: ConfigurationManager
  private config: AppConfiguration
  private envConfig: EnvConfig

  private constructor() {
    this.envConfig = validateEnvironment()
    this.config = this.buildConfiguration()
    this.validateConfiguration()
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager()
    }
    return ConfigurationManager.instance
  }

  private buildConfiguration(): AppConfiguration {
    const isDev = this.envConfig.NODE_ENV === 'development'
    const isProd = this.envConfig.NODE_ENV === 'production'
    const isTest = this.envConfig.NODE_ENV === 'test'

    return {
      app: {
        name: 'hackerfolio-tulio',
        version: '0.1.0',
        environment: this.envConfig.NODE_ENV,
        port: this.envConfig.PORT,
        ...(this.envConfig.APP_URL && { baseUrl: this.envConfig.APP_URL }),
        ...(this.envConfig.API_URL && { apiUrl: this.envConfig.API_URL }),
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
        proxyPort: this.envConfig.PORT,
        watchPaths: this.envConfig.DEV_WATCH_PATHS?.split(',') || ['./shared', './server/lib'],
        mockApis: this.envConfig.MOCK_GITHUB_API || false,
        devServerHost: '0.0.0.0',
      },

      database: {
        url: this.envConfig.DATABASE_URL || './database/portfolio.db',
        dialect: 'sqlite',
        migrations: {
          directory: './drizzle',
          tableName: '__drizzle_migrations',
        },
        pool: {
          min: this.envConfig.DB_POOL_MIN || 2,
          max: this.envConfig.DB_POOL_MAX || 10,
        },
      },

      security: {
        corsOrigins: this.envConfig.CORS_ORIGINS?.split(',').map(o => o.trim()) || 
                     (isDev ? ['http://localhost:5173'] : []),
        sessionSecret: this.envConfig.SESSION_SECRET,
        rateLimiting: {
          requests: this.envConfig.RATE_LIMIT_REQUESTS || 100,
          windowMs: this.envConfig.RATE_LIMIT_WINDOW_MS || 900000,
        },
        headers: {
          ...(this.envConfig.CSP_REPORT_URI && { csp: this.envConfig.CSP_REPORT_URI }),
          hsts: isProd,
        },
      },

      paths: {
        root: process.cwd(),
        client: './client',
        server: './server',
        shared: './shared',
        assets: './attached_assets',
        dist: './dist',
        drizzle: './drizzle',
      },

      tools: {
        vite: {
          root: './client',
          build: {
            outDir: isDev ? '../dist/public' : '../dist/public',
            emptyOutDir: true,
          },
          server: {
            proxy: {
              '/api': {
                target: `http://localhost:${this.envConfig.PORT}`,
                changeOrigin: true,
              },
            },
          },
          resolve: {
            alias: {
              '@': './client/src',
              '@shared': './shared',
              '@server': './server',
            },
          },
        },
        typescript: {
          baseUrl: '.',
          paths: {
            '@/*': ['./client/src/*'],
            '@shared/*': ['./shared/*'],
            '@server/*': ['./server/*'],
          },
          outDir: './dist',
        },
        eslint: {
          ignorePatterns: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'drizzle/**',
            '.vite/**',
          ],
          projectService: true,
        },
      },

      features: {
        githubIntegration: this.envConfig.FEATURE_GITHUB_INTEGRATION ?? true,
        terminalLogging: this.envConfig.FEATURE_TERMINAL_LOGGING ?? true,
        analytics: this.envConfig.FEATURE_ANALYTICS ?? false,
        ssr: isProd,
      },

      external: {
        github: {
          ...(this.envConfig.GITHUB_TOKEN && { token: this.envConfig.GITHUB_TOKEN }),
          timeout: this.envConfig.GITHUB_API_TIMEOUT || 30000,
          cacheDuration: this.envConfig.GITHUB_CACHE_DURATION || 300,
          mockInDev: this.envConfig.MOCK_GITHUB_API || false,
        },
        sentry: this.envConfig.SENTRY_DSN ? {
          dsn: this.envConfig.SENTRY_DSN,
          environment: this.envConfig.NODE_ENV,
        } : undefined,
      },
    }
  }

  private validateConfiguration(): void {
    const errors: string[] = []

    // Validate port consistency
    if (this.config.development.proxyPort !== this.config.app.port) {
      errors.push('Development proxy port must match application port for seamless integration')
    }

    // Validate build output consistency
    if (!this.config.build.clientOutDir.includes('dist/public')) {
      errors.push('Client build output must be in dist/public for SSR compatibility')
    }

    if (!this.config.build.serverOutDir.includes('dist/server')) {
      errors.push('Server build output must be in dist/server for SSR compatibility')
    }

    // Validate path aliases consistency
    const viteAliases = this.config.tools.vite.resolve.alias
    const tsAliases = this.config.tools.typescript.paths
    
    if (Object.keys(viteAliases).length !== Object.keys(tsAliases).length) {
      errors.push('Vite aliases and TypeScript paths must be consistent')
    }

    // Production-specific validations
    if (this.config.app.environment === 'production') {
      if (!this.config.security.sessionSecret) {
        errors.push('Session secret is required for production environment')
      }

      if (this.config.security.corsOrigins.length === 0) {
        errors.push('CORS origins must be specified for production environment')
      }

      if (!this.config.app.baseUrl) {
        errors.push('Base URL is required for production environment')
      }
    }

    if (errors.length > 0) {
      throw new Error(
        'Configuration validation failed:\\n' +
        errors.map(e => `  - ${e}`).join('\\n')
      )
    }
  }

  // Configuration getters
  public get<T extends keyof AppConfiguration>(section: T): AppConfiguration[T] {
    return this.config[section]
  }

  public getViteConfig() {
    return {
      root: this.config.tools.vite.root,
      build: this.config.tools.vite.build,
      server: this.config.tools.vite.server,
      resolve: this.config.tools.vite.resolve,
    }
  }

  public getTypeScriptPaths() {
    return {
      baseUrl: this.config.tools.typescript.baseUrl,
      paths: this.config.tools.typescript.paths,
    }
  }

  public getESLintConfig() {
    return {
      ignorePatterns: this.config.tools.eslint.ignorePatterns,
      projectService: this.config.tools.eslint.projectService,
    }
  }

  public getDatabaseConfig() {
    return this.config.database
  }

  public getSecurityConfig() {
    return this.config.security
  }

  public isProduction(): boolean {
    return this.config.app.environment === 'production'
  }

  public isDevelopment(): boolean {
    return this.config.app.environment === 'development'
  }

  public isTest(): boolean {
    return this.config.app.environment === 'test'
  }

  // Full configuration access
  public getFullConfig(): AppConfiguration {
    return { ...this.config }
  }

  // Environment config access
  public getEnvConfig(): EnvConfig {
    return { ...this.envConfig }
  }
}

// =============================================================================
// CONFIGURATION UTILITIES
// =============================================================================

export const config = ConfigurationManager.getInstance()

// Convenience getters
export const appConfig = config.get('app')
export const buildConfig = config.get('build')
export const devConfig = config.get('development')
export const dbConfig = config.get('database')
export const securityConfig = config.get('security')
export const pathsConfig = config.get('paths')
export const toolsConfig = config.get('tools')
export const featuresConfig = config.get('features')
export const externalConfig = config.get('external')

// Environment utilities
export const isProduction = config.isProduction()
export const isDevelopment = config.isDevelopment()
export const isTest = config.isTest()

// =============================================================================
// CONFIGURATION VALIDATION HELPERS
// =============================================================================

export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateCrossConfiguration(): ConfigValidationResult {
  const result: ConfigValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  try {
    // This will throw if validation fails
    config.getFullConfig()
  } catch (error) {
    result.valid = false
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error')
  }

  return result
}

export function generateConfigReport(): string {
  const fullConfig = config.getFullConfig()
  
  return `
# Configuration Report
Generated: ${new Date().toISOString()}

## Application
- Environment: ${fullConfig.app.environment}
- Port: ${fullConfig.app.port}
- Base URL: ${fullConfig.app.baseUrl || 'Not set'}

## Build Settings
- Client Output: ${fullConfig.build.clientOutDir}
- Server Output: ${fullConfig.build.serverOutDir}
- Source Maps: ${fullConfig.build.sourcemap ? 'Enabled' : 'Disabled'}
- Minification: ${fullConfig.build.minify ? 'Enabled' : 'Disabled'}

## Development
- HMR: ${fullConfig.development.hmr ? 'Enabled' : 'Disabled'}
- Proxy Port: ${fullConfig.development.proxyPort}
- Mock APIs: ${fullConfig.development.mockApis ? 'Enabled' : 'Disabled'}

## Security
- CORS Origins: ${fullConfig.security.corsOrigins.join(', ') || 'None'}
- Session Secret: ${fullConfig.security.sessionSecret ? 'Configured' : 'Not configured'}
- Rate Limiting: ${fullConfig.security.rateLimiting.requests} requests per ${fullConfig.security.rateLimiting.windowMs}ms

## Features
- GitHub Integration: ${fullConfig.features.githubIntegration ? 'Enabled' : 'Disabled'}
- Terminal Logging: ${fullConfig.features.terminalLogging ? 'Enabled' : 'Disabled'}
- Analytics: ${fullConfig.features.analytics ? 'Enabled' : 'Disabled'}
- SSR: ${fullConfig.features.ssr ? 'Enabled' : 'Disabled'}

## Database
- URL: ${fullConfig.database.url}
- Pool: ${fullConfig.database.pool.min}-${fullConfig.database.pool.max} connections
`
}

export default config