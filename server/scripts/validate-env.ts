#!/usr/bin/env node

import { validateEnvironment, type EnvConfig } from '../lib/env-config.js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ANSI color codes for terminal output
const colors = {
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  magenta: '\\x1b[35m',
  cyan: '\\x1b[36m',
  white: '\\x1b[37m',
  reset: '\\x1b[0m',
  bold: '\\x1b[1m',
  dim: '\\x1b[2m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

function logSection(title: string, content: string): void {
  console.log(`\\n${colorize(colors.bold + title, 'cyan')}`)
  console.log(colorize('='.repeat(title.length), 'cyan'))
  console.log(content)
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

function checkEnvFile(): boolean {
  const envPath = resolve(process.cwd(), '.env')
  const envExamplePath = resolve(process.cwd(), '.env.example')
  
  if (!existsSync(envPath)) {
    logWarning('.env file not found')
    
    if (existsSync(envExamplePath)) {
      logInfo('Copy .env.example to .env and update the values:')
      console.log(colorize('  cp .env.example .env', 'dim'))
    } else {
      logError('.env.example file also not found!')
    }
    
    return false
  }
  
  logSuccess('.env file found')
  return true
}

function analyzeEnvironment(env: EnvConfig): void {
  logSection('Environment Analysis', '')
  
  // Environment type
  logInfo(`Environment: ${colorize(env.NODE_ENV, 'magenta')}`)
  logInfo(`Port: ${colorize(String(env.PORT), 'magenta')}`)
  
  // Database configuration
  if (env.DATABASE_URL) {
    logSuccess(`Database configured: ${env.DATABASE_URL}`)
  } else {
    logInfo('Using default SQLite database (file:./portfolio.db)')
  }
  
  // External API configuration
  if (env.GITHUB_TOKEN) {
    logSuccess('GitHub token configured')
  } else {
    logWarning('GitHub token not configured - commit fetching may be rate limited')
  }
  
  // Security configuration
  if (env.NODE_ENV === 'production') {
    if (env.SESSION_SECRET) {
      logSuccess('Session secret configured')
    } else {
      logError('Session secret required for production!')
    }
    
    if (env.CORS_ORIGINS) {
      logSuccess(`CORS origins configured: ${env.CORS_ORIGINS}`)
    } else {
      logError('CORS origins required for production!')
    }
  }
  
  // Feature flags
  logSection('Feature Flags', '')
  const features = [
    { name: 'GitHub Integration', enabled: env.FEATURE_GITHUB_INTEGRATION },
    { name: 'Terminal Logging', enabled: env.FEATURE_TERMINAL_LOGGING },
    { name: 'Analytics', enabled: env.FEATURE_ANALYTICS },
  ]
  
  features.forEach(feature => {
    if (feature.enabled) {
      logSuccess(`${feature.name}: enabled`)
    } else {
      logInfo(`${feature.name}: disabled`)
    }
  })
  
  // Development-specific warnings
  if (env.NODE_ENV === 'development') {
    logSection('Development Notes', '')
    logInfo('Running in development mode')
    
    if (env.DEBUG) {
      logInfo('Debug mode enabled - additional logging will be shown')
    }
    
    if (env.MOCK_GITHUB_API) {
      logWarning('GitHub API mocking enabled')
    }
  }
  
  // Production-specific checks
  if (env.NODE_ENV === 'production') {
    logSection('Production Checklist', '')
    
    const checks = [
      { name: 'Session secret configured', passed: Boolean(env.SESSION_SECRET) },
      { name: 'CORS origins configured', passed: Boolean(env.CORS_ORIGINS) },
      { name: 'Compression enabled', passed: env.ENABLE_COMPRESSION !== false },
      { name: 'Log level appropriate', passed: env.LOG_LEVEL !== 'debug' },
      { name: 'Debug mode disabled', passed: !env.DEBUG },
    ]
    
    let allPassed = true
    checks.forEach(check => {
      if (check.passed) {
        logSuccess(check.name)
      } else {
        logError(check.name)
        allPassed = false
      }
    })
    
    if (allPassed) {
      logSuccess('All production checks passed!')
    } else {
      logError('Some production checks failed - please review your configuration')
    }
  }
}

function generateEnvTemplate(): void {
  logSection('Missing Environment Variables', '')
  logInfo('Consider adding these variables to your .env file:')
  
  const recommendations = [
    '# GitHub integration',
    'GITHUB_TOKEN=your_github_token_here',
    '',
    '# Security (production)',
    'SESSION_SECRET=your_secure_session_secret_here',
    'CORS_ORIGINS=https://yourdomain.com',
    '',
    '# Optional features',
    'FEATURE_ANALYTICS=false',
    'DEBUG=false',
  ]
  
  recommendations.forEach(line => {
    console.log(colorize(line, 'dim'))
  })
}

function main(): void {
  console.log(colorize(colors.bold + 'HackerFolio Environment Validator', 'cyan'))
  console.log(colorize('Validating environment configuration...', 'dim'))
  
  try {
    // Check for .env file
    const hasEnvFile = checkEnvFile()
    
    // Validate environment
    const env = validateEnvironment()
    
    logSuccess('Environment validation passed!')
    
    // Analyze configuration
    analyzeEnvironment(env)
    
    if (!hasEnvFile) {
      generateEnvTemplate()
    }
    
    logSection('Summary', '')
    logSuccess('Environment is properly configured')
    
    if (env.NODE_ENV === 'production') {
      logInfo('Ready for production deployment')
    } else {
      logInfo('Ready for development')
    }
    
  } catch (error) {
    logError('Environment validation failed!')
    console.log()
    
    if (error instanceof Error) {
      // Format validation errors nicely
      const lines = error.message.split('\\n')
      lines.forEach(line => {
        if (line.trim()) {
          console.log(colorize(`  ${line}`, 'red'))
        }
      })
    }
    
    console.log()
    logInfo('Please check your .env file against .env.example')
    
    process.exit(1)
  }
}

// Run the validator
main()