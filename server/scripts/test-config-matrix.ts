#!/usr/bin/env bun
/**
 * Configuration Testing Framework with Validation Matrix
 * 
 * This script implements comprehensive configuration testing across all environments:
 * - Development Environment Testing
 * - Production Environment Testing  
 * - Test Environment Testing
 * - Cross-environment validation matrix
 * - Configuration consistency checks
 */

import { spawn } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { createTestConfig, testEnvironments } from './config-test-utils'

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
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

interface EnvironmentTestSuite {
  environment: string
  results: TestResult[]
  passed: number
  failed: number
  total: number
}

class ConfigurationTestFramework {
  private projectRoot: string
  private originalEnv: Record<string, string | undefined>
  private testResults: EnvironmentTestSuite[] = []

  constructor() {
    this.projectRoot = process.cwd()
    this.originalEnv = { ...process.env }
  }

  async runAllTests(): Promise<void> {
    console.log(colorize('🧪 Configuration Testing Framework', 'cyan'))
    console.log(colorize('=====================================', 'cyan'))
    console.log('')

    try {
      await this.testDevelopmentEnvironment()
      await this.testProductionEnvironment()
      await this.testTestEnvironment()
      await this.testCrossEnvironmentMatrix()
      this.generateTestReport()
    } finally {
      this.restoreEnvironment()
    }
  }

  private async testDevelopmentEnvironment(): Promise<void> {
    console.log(colorize('🔧 Testing Development Environment...', 'cyan'))
    
    const suite: EnvironmentTestSuite = {
      environment: 'development',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    }

    // Set development environment
    this.setTestEnvironment('development', {
      NODE_ENV: 'development',
      PORT: '3001',
      DEBUG: 'true',
      LOG_LEVEL: 'debug'
    })

    // Test development-specific configurations
    await this.runTest(suite, 'Central Config Loads', async () => {
      const { config } = await import('../../shared/config')
      return config.isDevelopment()
    })

    await this.runTest(suite, 'HMR Enabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('development').hmr === true
    })

    await this.runTest(suite, 'Source Maps Enabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('build').sourcemap === true
    })

    await this.runTest(suite, 'Minification Disabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('build').minify === false
    })

    await this.runTest(suite, 'CORS Development Origins', async () => {
      const { config } = await import('../../shared/config')
      const origins = config.get('security').corsOrigins
      return origins.includes('http://localhost:5173')
    })

    await this.runTest(suite, 'Port Configuration Consistent', async () => {
      const { config } = await import('../../shared/config')
      const appPort = config.get('app').port
      const devPort = config.get('development').proxyPort
      return appPort === devPort
    })

    this.testResults.push(suite)
    this.printSuiteResults(suite)
  }

  private async testProductionEnvironment(): Promise<void> {
    console.log(colorize('🚀 Testing Production Environment...', 'cyan'))
    
    const suite: EnvironmentTestSuite = {
      environment: 'production',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    }

    // Set production environment
    this.setTestEnvironment('production', {
      NODE_ENV: 'production',
      PORT: '3001',
      APP_URL: 'https://example.com',
      API_URL: 'https://api.example.com',
      SESSION_SECRET: 'test-secret-key-32-characters-long',
      CORS_ORIGINS: 'https://example.com,https://www.example.com',
      LOG_LEVEL: 'info'
    })

    await this.runTest(suite, 'Central Config Loads', async () => {
      const { config } = await import('../../shared/config')
      return config.isProduction()
    })

    await this.runTest(suite, 'Source Maps Production Setting', async () => {
      const { config } = await import('../../shared/config')
      return config.get('build').sourcemap === false
    })

    await this.runTest(suite, 'Minification Enabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('build').minify === true
    })

    await this.runTest(suite, 'SSR Enabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('features').ssr === true
    })

    await this.runTest(suite, 'Session Secret Required', async () => {
      const { config } = await import('../../shared/config')
      return Boolean(config.get('security').sessionSecret)
    })

    await this.runTest(suite, 'CORS Origins Configured', async () => {
      const { config } = await import('../../shared/config')
      const origins = config.get('security').corsOrigins
      return origins.length > 0 && !origins.includes('http://localhost:5173')
    })

    await this.runTest(suite, 'HSTS Headers Enabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('security').headers.hsts === true
    })

    this.testResults.push(suite)
    this.printSuiteResults(suite)
  }

  private async testTestEnvironment(): Promise<void> {
    console.log(colorize('🧪 Testing Test Environment...', 'cyan'))
    
    const suite: EnvironmentTestSuite = {
      environment: 'test',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    }

    // Set test environment
    this.setTestEnvironment('test', {
      NODE_ENV: 'test',
      PORT: '3001',
      LOG_LEVEL: 'silent',
      DATABASE_URL: ':memory:',
      MOCK_GITHUB_API: 'true'
    })

    await this.runTest(suite, 'Central Config Loads', async () => {
      const { config } = await import('../../shared/config')
      return config.isTest()
    })

    await this.runTest(suite, 'Source Maps Test Setting', async () => {
      const { config } = await import('../../shared/config')
      return config.get('build').sourcemap === true
    })

    await this.runTest(suite, 'Minification Disabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('build').minify === false
    })

    await this.runTest(suite, 'GitHub API Mocking', async () => {
      const { config } = await import('../../shared/config')
      return config.get('external').github.mockInDev === true
    })

    await this.runTest(suite, 'SSR Disabled', async () => {
      const { config } = await import('../../shared/config')
      return config.get('features').ssr === false
    })

    this.testResults.push(suite)
    this.printSuiteResults(suite)
  }

  private async testCrossEnvironmentMatrix(): Promise<void> {
    console.log(colorize('🔄 Testing Cross-Environment Matrix...', 'cyan'))
    
    const suite: EnvironmentTestSuite = {
      environment: 'cross-environment',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    }

    // Test configuration consistency across environments
    await this.runTest(suite, 'Path Mappings Consistent', async () => {
      // Test that path mappings work the same in all environments
      return this.testPathMappingsConsistency()
    })

    await this.runTest(suite, 'Build Outputs Consistent', async () => {
      // Test that build outputs are the same across environments
      return this.testBuildOutputConsistency()
    })

    await this.runTest(suite, 'Port Configuration Matrix', async () => {
      // Test port consistency across all environments
      return this.testPortConsistency()
    })

    await this.runTest(suite, 'Database Configuration Valid', async () => {
      // Test database config works in all environments
      return this.testDatabaseConfiguration()
    })

    await this.runTest(suite, 'Security Headers Matrix', async () => {
      // Test security headers are appropriate for each environment
      return this.testSecurityHeadersMatrix()
    })

    this.testResults.push(suite)
    this.printSuiteResults(suite)
  }

  private async runTest(suite: EnvironmentTestSuite, name: string, testFn: () => Promise<boolean>): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Clear module cache to ensure fresh config loading
      this.clearConfigCache()
      
      const result = await testFn()
      const duration = Date.now() - startTime
      
      const testResult: TestResult = {
        name,
        passed: result,
        message: result ? 'Passed' : 'Failed',
        duration
      }
      
      suite.results.push(testResult)
      suite.total++
      
      if (result) {
        suite.passed++
        console.log(colorize(`  ✓ ${name}`, 'green'))
      } else {
        suite.failed++
        console.log(colorize(`  ✗ ${name}`, 'red'))
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      const testResult: TestResult = {
        name,
        passed: false,
        message: `Error: ${error}`,
        duration
      }
      
      suite.results.push(testResult)
      suite.total++
      suite.failed++
      
      console.log(colorize(`  ✗ ${name} - ${error}`, 'red'))
    }
  }

  private setTestEnvironment(env: string, variables: Record<string, string>): void {
    // Create a minimal environment with only our test variables
    const minimalEnv = {
      NODE_ENV: env,
      ...variables
    }
    
    // Store current environment for restoration
    Object.keys(process.env).forEach(key => {
      if (this.originalEnv[key] === undefined) {
        this.originalEnv[key] = process.env[key]
      }
    })
    
    // Clear all environment variables except essentials
    const essentialVars = ['PATH', 'HOME', 'NODE', 'BUN_INSTALL', 'SHELL', 'USER']
    Object.keys(process.env).forEach(key => {
      if (!essentialVars.includes(key)) {
        delete process.env[key]
      }
    })
    
    // Set test-specific variables
    Object.entries(minimalEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
  }

  private clearConfigCache(): void {
    // Clear require cache for config modules
    const configModules = [
      '../../shared/config',
      '../../server/lib/env-config'
    ]
    
    configModules.forEach(module => {
      try {
        const resolvedPath = require.resolve(module, { paths: [__dirname] })
        delete require.cache[resolvedPath]
      } catch (error) {
        // Module might not be cached yet, ignore
      }
    })
    
    // Also clear dynamic imports cache by deleting from module registry
    // This is needed for ES modules
    Object.keys(require.cache).forEach(key => {
      if (key.includes('config') || key.includes('env-config')) {
        delete require.cache[key]
      }
    })
  }

  private async testPathMappingsConsistency(): Promise<boolean> {
    try {
      const environments = ['development', 'production', 'test'] as const
      const pathMappings: any[] = []
      
      for (const env of environments) {
        const config = createTestConfig(testEnvironments[env])
        pathMappings.push(config.get('tools').typescript.paths)
      }
      
      // Check if all path mappings are identical
      const firstMapping = JSON.stringify(pathMappings[0])
      const allMatch = pathMappings.every(mapping => JSON.stringify(mapping) === firstMapping)
      
      if (!allMatch) {
        console.log('Path mappings differ:', pathMappings.map((p, i) => ({ env: environments[i], paths: p })))
      }
      
      return allMatch
      
    } catch (error) {
      console.log('Path mappings test error:', error)
      return false
    }
  }

  private async testBuildOutputConsistency(): Promise<boolean> {
    try {
      const environments = ['development', 'production', 'test'] as const
      const buildOutputs: any[] = []
      
      for (const env of environments) {
        const config = createTestConfig(testEnvironments[env])
        const build = config.get('build')
        buildOutputs.push({
          clientOutDir: build.clientOutDir,
          serverOutDir: build.serverOutDir
        })
      }
      
      // Check if output directories are consistent
      const firstOutput = JSON.stringify(buildOutputs[0])
      const allMatch = buildOutputs.every(output => JSON.stringify(output) === firstOutput)
      
      if (!allMatch) {
        console.log('Build outputs differ:', buildOutputs.map((b, i) => ({ env: environments[i], build: b })))
      }
      
      return allMatch
      
    } catch (error) {
      console.log('Build outputs test error:', error)
      return false
    }
  }

  private async testPortConsistency(): Promise<boolean> {
    try {
      const environments = ['development', 'production', 'test'] as const
      
      for (const env of environments) {
        const config = createTestConfig(testEnvironments[env])
        const appPort = config.get('app').port
        const devPort = config.get('development').proxyPort
        
        if (appPort !== devPort) {
          console.log(`Port mismatch in ${env}: app=${appPort}, proxy=${devPort}`)
          return false
        }
      }
      
      return true
      
    } catch (error) {
      console.log('Port consistency test error:', error)
      return false
    }
  }

  private async testDatabaseConfiguration(): Promise<boolean> {
    try {
      const environments = ['development', 'production', 'test'] as const
      
      for (const env of environments) {
        const config = createTestConfig(testEnvironments[env])
        const dbConfig = config.get('database')
        
        // Check that database configuration exists and is valid
        if (!dbConfig.url || !dbConfig.dialect) {
          console.log(`Database config invalid in ${env}:`, dbConfig)
          return false
        }
      }
      
      return true
      
    } catch (error) {
      console.log('Database configuration test error:', error)
      return false
    }
  }

  private async testSecurityHeadersMatrix(): Promise<boolean> {
    try {
      // Test development
      const devConfig = createTestConfig(testEnvironments.development)
      const devHsts = devConfig.get('security').headers.hsts
      
      // Test production
      const prodConfig = createTestConfig(testEnvironments.production)
      const prodHsts = prodConfig.get('security').headers.hsts
      
      // HSTS should be disabled in dev, enabled in prod
      const result = devHsts === false && prodHsts === true
      
      if (!result) {
        console.log(`Security headers mismatch: dev HSTS=${devHsts}, prod HSTS=${prodHsts}`)
      }
      
      return result
      
    } catch (error) {
      console.log('Security headers test error:', error)
      return false
    }
  }

  private printSuiteResults(suite: EnvironmentTestSuite): void {
    console.log('')
    const passRate = ((suite.passed / suite.total) * 100).toFixed(1)
    
    if (suite.failed === 0) {
      console.log(colorize(`✅ ${suite.environment}: ${suite.passed}/${suite.total} tests passed (${passRate}%)`, 'green'))
    } else {
      console.log(colorize(`❌ ${suite.environment}: ${suite.passed}/${suite.total} tests passed (${passRate}%)`, 'red'))
    }
    console.log('')
  }

  private generateTestReport(): void {
    console.log(colorize('📊 Configuration Test Matrix Summary', 'cyan'))
    console.log(colorize('=======================================', 'cyan'))
    console.log('')

    let totalPassed = 0
    let totalFailed = 0
    let totalTests = 0

    this.testResults.forEach(suite => {
      totalPassed += suite.passed
      totalFailed += suite.failed
      totalTests += suite.total
      
      const passRate = ((suite.passed / suite.total) * 100).toFixed(1)
      const status = suite.failed === 0 ? '✅' : '❌'
      
      console.log(`${status} ${suite.environment.padEnd(15)} ${suite.passed}/${suite.total} (${passRate}%)`)
    })

    console.log('')
    console.log(colorize('Overall Results:', 'cyan'))
    
    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1)
    
    if (totalFailed === 0) {
      console.log(colorize(`🎉 All ${totalTests} configuration tests passed! (${overallPassRate}%)`, 'green'))
    } else {
      console.log(colorize(`⚠️  ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`, 'yellow'))
      console.log(colorize(`${totalFailed} tests failed`, 'red'))
    }

    // Generate detailed report
    const reportPath = join(this.projectRoot, 'config-test-report.json')
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        passRate: overallPassRate
      },
      environments: this.testResults
    }
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log('')
    console.log(colorize(`📄 Detailed report saved to: ${reportPath}`, 'blue'))
  }

  private restoreEnvironment(): void {
    // Clear all environment variables except essentials
    const essentialVars = ['PATH', 'HOME', 'NODE', 'BUN_INSTALL', 'SHELL', 'USER']
    Object.keys(process.env).forEach(key => {
      if (!essentialVars.includes(key)) {
        delete process.env[key]
      }
    })
    
    // Restore original environment
    Object.keys(this.originalEnv).forEach(key => {
      const value = this.originalEnv[key]
      if (value !== undefined) {
        process.env[key] = value
      }
    })
    
    // Clear config cache one final time
    this.clearConfigCache()
  }
}

// Execute the test framework
const framework = new ConfigurationTestFramework()
await framework.runAllTests()