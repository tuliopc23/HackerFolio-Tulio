#!/usr/bin/env bun
/**
 * Production Configuration Hardening Script
 *
 * This script implements comprehensive security validation and hardening for production:
 * - Environment variable validation and sanitization
 * - Security headers verification
 * - SSL/TLS configuration checks
 * - Performance optimization validation
 * - Dependency security scanning
 * - Build artifact security analysis
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { config } from '../../shared/config'

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

function logSection(title: string): void {
  console.log(`\\n${colorize(colors.bold + title, 'cyan')}`)
  console.log(colorize('='.repeat(title.length), 'cyan'))
}

function logSuccess(message: string): void {
  console.log(colorize(`✓ ${message}`, 'green'))
}

function logWarning(message: string): void {
  console.log(colorize(`⚠ ${message}`, 'yellow'))
}

function logError(message: string): void {
  console.log(colorize(`✗ ${message}`, 'red'))
}

function logInfo(message: string): void {
  console.log(colorize(`ℹ ${message}`, 'blue'))
}

function logCritical(message: string): void {
  console.log(colorize(`🚨 CRITICAL: ${message}`, 'red'))
}

interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  message: string
  recommendation: string
}

interface ProductionHardeningResult {
  passed: boolean
  issues: SecurityIssue[]
  score: number
  recommendations: string[]
}

class ProductionHardening {
  private projectRoot: string
  private result: ProductionHardeningResult

  constructor() {
    this.projectRoot = process.cwd()
    this.result = {
      passed: true,
      issues: [],
      score: 100,
      recommendations: [],
    }
  }

  private addIssue(
    severity: SecurityIssue['severity'],
    category: string,
    message: string,
    recommendation: string
  ): void {
    this.result.issues.push({ severity, category, message, recommendation })

    // Deduct points based on severity
    const penalties = { low: 2, medium: 5, high: 10, critical: 25 }
    this.result.score -= penalties[severity]

    if (severity === 'high' || severity === 'critical') {
      this.result.passed = false
    }
  }

  async run(): Promise<void> {
    console.log(colorize('🔒 Production Configuration Hardening', 'cyan'))
    console.log(colorize('=====================================', 'cyan'))
    console.log('')

    // Run all security checks
    await this.validateEnvironmentSecurity()
    await this.validateSecurityHeaders()
    await this.validateSSLConfiguration()
    await this.validateDependencySecurity()
    await this.validateBuildSecurity()
    await this.validateServerSecurity()
    await this.validatePerformanceOptimization()

    // Generate comprehensive report
    this.generateSecurityReport()
  }

  private async validateEnvironmentSecurity(): Promise<void> {
    logSection('Environment Security Validation')

    try {
      const envConfig = config.getEnvConfig()
      const appConfig = config.get('app')
      const securityConfig = config.get('security')

      // Check production environment
      if (appConfig.environment !== 'production') {
        this.addIssue(
          'medium',
          'Environment',
          'NODE_ENV is not set to production',
          'Set NODE_ENV=production for production deployments'
        )
      } else {
        logSuccess('NODE_ENV set to production')
      }

      // Validate required production variables
      const requiredProdVars = ['APP_URL', 'API_URL', 'SESSION_SECRET', 'CORS_ORIGINS']
      for (const varName of requiredProdVars) {
        const value = process.env[varName]
        if (!value) {
          this.addIssue(
            'critical',
            'Environment',
            `Missing required production variable: ${varName}`,
            `Set ${varName} in your production environment`
          )
        } else {
          logSuccess(`${varName} is configured`)
        }
      }

      // Validate session secret strength
      if (securityConfig.sessionSecret) {
        if (securityConfig.sessionSecret.length < 32) {
          this.addIssue(
            'high',
            'Security',
            'Session secret is too short',
            'Use a session secret with at least 32 characters'
          )
        } else if (
          securityConfig.sessionSecret === 'your_secure_session_secret_here_minimum_32_characters'
        ) {
          this.addIssue(
            'critical',
            'Security',
            'Using default session secret',
            'Generate a unique, random session secret for production'
          )
        } else {
          logSuccess('Session secret meets security requirements')
        }
      }

      // Check for development/debug flags
      if (envConfig.DEBUG) {
        this.addIssue(
          'medium',
          'Security',
          'DEBUG mode enabled in production',
          'Disable DEBUG mode for production deployments'
        )
      } else {
        logSuccess('DEBUG mode disabled')
      }

      // Validate CORS origins
      if (securityConfig.corsOrigins.includes('http://localhost:5173')) {
        this.addIssue(
          'high',
          'Security',
          'Development CORS origins in production',
          'Remove localhost origins from production CORS configuration'
        )
      } else {
        logSuccess('CORS origins properly configured for production')
      }
    } catch (error) {
      this.addIssue(
        'high',
        'Environment',
        `Environment validation failed: ${error}`,
        'Fix environment configuration errors'
      )
    }
  }

  private async validateSecurityHeaders(): Promise<void> {
    logSection('Security Headers Validation')

    const securityConfig = config.get('security')

    // Check HSTS
    if (securityConfig.headers.hsts) {
      logSuccess('HSTS headers enabled')
    } else {
      this.addIssue(
        'medium',
        'Security Headers',
        'HSTS headers not enabled',
        'Enable HSTS headers for production HTTPS sites'
      )
    }

    // Check CSP
    if (securityConfig.headers.csp) {
      logSuccess('Content Security Policy configured')
    } else {
      this.addIssue(
        'medium',
        'Security Headers',
        'Content Security Policy not configured',
        'Implement CSP headers to prevent XSS attacks'
      )
    }

    // Validate rate limiting
    const rateLimit = securityConfig.rateLimiting
    if (rateLimit.requests >= 1000) {
      this.addIssue(
        'medium',
        'Security',
        'Rate limiting too permissive',
        'Consider lowering rate limit for production'
      )
    } else {
      logSuccess(
        `Rate limiting configured: ${rateLimit.requests} requests per ${rateLimit.windowMs}ms`
      )
    }
  }

  private async validateSSLConfiguration(): Promise<void> {
    logSection('SSL/TLS Configuration Validation')

    const appConfig = config.get('app')

    // Check HTTPS URLs
    if (appConfig.baseUrl && !appConfig.baseUrl.startsWith('https://')) {
      this.addIssue(
        'high',
        'SSL/TLS',
        'Base URL not using HTTPS',
        'Use HTTPS URLs for production deployments'
      )
    } else if (appConfig.baseUrl) {
      logSuccess('Base URL uses HTTPS')
    }

    if (appConfig.apiUrl && !appConfig.apiUrl.startsWith('https://')) {
      this.addIssue(
        'high',
        'SSL/TLS',
        'API URL not using HTTPS',
        'Use HTTPS URLs for API endpoints'
      )
    } else if (appConfig.apiUrl) {
      logSuccess('API URL uses HTTPS')
    }

    // Check for mixed content risks
    const { corsOrigins } = config.get('security')
    const httpOrigins = corsOrigins.filter(origin => origin.startsWith('http://'))
    if (httpOrigins.length > 0) {
      this.addIssue(
        'medium',
        'SSL/TLS',
        'HTTP origins in CORS configuration',
        'Use only HTTPS origins in production CORS settings'
      )
    } else {
      logSuccess('All CORS origins use HTTPS')
    }
  }

  private async validateDependencySecurity(): Promise<void> {
    logSection('Dependency Security Validation')

    try {
      const packageJsonRaw = JSON.parse(
        readFileSync(join(this.projectRoot, 'package.json'), 'utf-8')
      )

      // Type guard for package.json structure
      const isValidPackageJson = (
        data: unknown
      ): data is {
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      } => {
        return typeof data === 'object' && data !== null
      }

      if (!isValidPackageJson(packageJsonRaw)) {
        this.addIssue(
          'medium',
          'Dependencies',
          'Could not parse package.json',
          'Ensure package.json has valid structure'
        )
        return
      }

      // Now packageJsonRaw is properly typed
      const packageJson = packageJsonRaw

      // Check for known vulnerable packages (simplified check)
      const vulnerablePackages = ['lodash@<4.17.21', 'axios@<0.21.2', 'express@<4.17.3']

      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
      let vulnerabilitiesFound = 0

      for (const [packageName] of Object.entries(dependencies)) {
        // This is a simplified check - in real scenarios, use npm audit or similar
        const isVulnerable = vulnerablePackages.some(vuln => vuln.startsWith(packageName))
        if (isVulnerable) {
          vulnerabilitiesFound++
          this.addIssue(
            'medium',
            'Dependencies',
            `Potentially vulnerable package: ${packageName}`,
            'Update to latest secure version'
          )
        }
      }

      if (vulnerabilitiesFound === 0) {
        logSuccess('No obvious vulnerable dependencies detected')
      }

      // Check for unnecessary dev dependencies in production
      if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
        logInfo('Consider using --production flag when installing dependencies')
      }
    } catch (error) {
      this.addIssue(
        'medium',
        'Dependencies',
        'Could not analyze package.json',
        'Ensure package.json is valid and accessible'
      )
    }
  }

  private async validateBuildSecurity(): Promise<void> {
    logSection('Build Security Validation')

    const buildConfig = config.get('build')

    // Check minification
    if (!buildConfig.minify) {
      this.addIssue(
        'medium',
        'Build',
        'Minification disabled in production',
        'Enable minification for production builds'
      )
    } else {
      logSuccess('Minification enabled')
    }

    // Check source maps
    if (buildConfig.sourcemap) {
      this.addIssue(
        'medium',
        'Build',
        'Source maps enabled in production',
        'Disable source maps for production to protect source code'
      )
    } else {
      logSuccess('Source maps disabled for production')
    }

    // Check build output directories
    const distPath = join(this.projectRoot, 'dist')
    if (existsSync(distPath)) {
      logSuccess('Build output directory exists')
    } else {
      this.addIssue(
        'medium',
        'Build',
        'Build output directory not found',
        'Run production build before deployment'
      )
    }
  }

  private async validateServerSecurity(): Promise<void> {
    logSection('Server Security Validation')

    // Check server configuration
    const appConfig = config.get('app')

    // Validate port
    if (appConfig.port === 3000 || appConfig.port === 8080) {
      this.addIssue(
        'low',
        'Server',
        'Using common default port',
        'Consider using a non-standard port for additional security'
      )
    } else {
      logSuccess(`Server configured on port ${appConfig.port}`)
    }

    // Check features
    if (config.get('features').analytics && !config.get('external').sentry) {
      this.addIssue(
        'low',
        'Monitoring',
        'Analytics enabled but no error tracking configured',
        'Consider adding error tracking (e.g., Sentry) for production monitoring'
      )
    }

    if (config.get('features').ssr) {
      logSuccess('Server-side rendering enabled for performance')
    } else {
      logInfo('Consider enabling SSR for better SEO and performance')
    }
  }

  private async validatePerformanceOptimization(): Promise<void> {
    logSection('Performance Optimization Validation')

    const buildConfig = config.get('build')

    // Check build optimizations
    if (buildConfig.minify && !buildConfig.sourcemap) {
      logSuccess('Build optimized for production')
    }

    // Check compression
    const envConfig = config.getEnvConfig()
    if (envConfig.ENABLE_COMPRESSION !== false) {
      logSuccess('Compression enabled')
    } else {
      this.addIssue(
        'low',
        'Performance',
        'Compression disabled',
        'Enable gzip/brotli compression for better performance'
      )
    }

    // Check caching
    if (envConfig.API_CACHE_ENABLED !== false) {
      logSuccess('API caching enabled')
    } else {
      logInfo('Consider enabling API caching for better performance')
    }

    // Check static asset caching
    const staticCacheDuration = envConfig.STATIC_CACHE_DURATION || 86400
    if (staticCacheDuration < 3600) {
      this.addIssue(
        'low',
        'Performance',
        'Static asset cache duration too short',
        'Increase cache duration for better performance'
      )
    } else {
      logSuccess(`Static assets cached for ${Math.floor(staticCacheDuration / 3600)}h`)
    }
  }

  private generateSecurityReport(): void {
    logSection('Production Security Report')

    // Calculate final score
    this.result.score = Math.max(0, this.result.score)

    // Determine grade
    let grade = 'F'
    let gradeColor: keyof typeof colors = 'red'

    if (this.result.score >= 95) {
      grade = 'A+'
      gradeColor = 'green'
    } else if (this.result.score >= 90) {
      grade = 'A'
      gradeColor = 'green'
    } else if (this.result.score >= 85) {
      grade = 'B+'
      gradeColor = 'cyan'
    } else if (this.result.score >= 80) {
      grade = 'B'
      gradeColor = 'cyan'
    } else if (this.result.score >= 75) {
      grade = 'C+'
      gradeColor = 'yellow'
    } else if (this.result.score >= 70) {
      grade = 'C'
      gradeColor = 'yellow'
    } else if (this.result.score >= 60) {
      grade = 'D'
      gradeColor = 'magenta'
    }

    console.log('')
    console.log(colorize(`Security Score: ${this.result.score}/100 (Grade: ${grade})`, gradeColor))
    console.log('')

    // Group issues by severity
    const criticalIssues = this.result.issues.filter(i => i.severity === 'critical')
    const highIssues = this.result.issues.filter(i => i.severity === 'high')
    const mediumIssues = this.result.issues.filter(i => i.severity === 'medium')
    const lowIssues = this.result.issues.filter(i => i.severity === 'low')

    if (criticalIssues.length > 0) {
      console.log(colorize('🚨 CRITICAL ISSUES (Must Fix):', 'red'))
      criticalIssues.forEach(issue => {
        logCritical(`[${issue.category}] ${issue.message}`)
        console.log(colorize(`   💡 ${issue.recommendation}`, 'yellow'))
      })
      console.log('')
    }

    if (highIssues.length > 0) {
      console.log(colorize('🔴 HIGH PRIORITY ISSUES:', 'red'))
      highIssues.forEach(issue => {
        logError(`[${issue.category}] ${issue.message}`)
        console.log(colorize(`   💡 ${issue.recommendation}`, 'yellow'))
      })
      console.log('')
    }

    if (mediumIssues.length > 0) {
      console.log(colorize('🟡 MEDIUM PRIORITY ISSUES:', 'yellow'))
      mediumIssues.forEach(issue => {
        logWarning(`[${issue.category}] ${issue.message}`)
        console.log(colorize(`   💡 ${issue.recommendation}`, 'blue'))
      })
      console.log('')
    }

    if (lowIssues.length > 0) {
      console.log(colorize('🔵 LOW PRIORITY RECOMMENDATIONS:', 'blue'))
      lowIssues.forEach(issue => {
        logInfo(`[${issue.category}] ${issue.message}`)
        console.log(colorize(`   💡 ${issue.recommendation}`, 'dim'))
      })
      console.log('')
    }

    // Overall assessment
    if (this.result.passed && this.result.score >= 85) {
      logSuccess('✅ Production configuration is secure and ready for deployment!')
    } else if (this.result.score >= 70) {
      logWarning('⚠️  Production configuration has some security concerns. Review recommendations.')
    } else {
      logError(
        '❌ Production configuration has significant security issues. Address critical and high priority issues before deployment.'
      )
    }

    // Save detailed report
    const reportPath = join(this.projectRoot, 'production-security-report.json')
    const report = {
      timestamp: new Date().toISOString(),
      score: this.result.score,
      grade,
      passed: this.result.passed,
      issues: this.result.issues,
      summary: {
        critical: criticalIssues.length,
        high: highIssues.length,
        medium: mediumIssues.length,
        low: lowIssues.length,
        total: this.result.issues.length,
      },
    }

    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log('')
    logInfo(`📄 Detailed security report saved to: ${reportPath}`)

    // Exit with appropriate code
    if (!this.result.passed) {
      console.log('')
      logError('Production security validation failed')
      process.exit(1)
    }
  }
}

// Run the production hardening validation
const hardening = new ProductionHardening()
await hardening.run()
