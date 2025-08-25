#!/usr/bin/env bun
/**
 * Enhanced Configuration Integration Validation Script
 * 
 * This script performs comprehensive validation of all configuration files
 * to ensure they are properly aligned and integrated:
 * - Central configuration consistency
 * - Cross-tool configuration alignment
 * - Environment-specific validation
 * - Build pipeline configuration
 * - Development workflow validation
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { exit } from 'node:process'
import { config, validateCrossConfiguration, generateConfigReport } from '../../shared/config'

// ANSI color codes for terminal output
const colors = {
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  magenta: '\\x1b[35m',
  cyan: '\\x1b[36m',
  reset: '\\x1b[0m',
  bold: '\\x1b[1m',
  dim: '\\x1b[2m',
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

interface ValidationResult {
  valid: boolean
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

class ConfigurationIntegrationValidator {
  private projectRoot: string
  private result: ValidationResult

  constructor() {
    this.projectRoot = process.cwd()
    this.result = {
      valid: true,
      issues: [],
      warnings: [],
      recommendations: [],
    }
  }

  private addIssue(message: string): void {
    this.result.issues.push(message)
    this.result.valid = false
  }

  private addWarning(message: string): void {
    this.result.warnings.push(message)
  }

  private addRecommendation(message: string): void {
    this.result.recommendations.push(message)
  }

  private readJsonFile(path: string): any {
    try {
      const content = readFileSync(path, 'utf-8')
      // Handle TypeScript config files with comments
      if (path.includes('tsconfig')) {
        // Remove single-line comments for JSON parsing
        const cleanContent = content.replace(/\/\/.*$/gm, '')
        return JSON.parse(cleanContent)
      }
      return JSON.parse(content)
    } catch (error) {
      this.addIssue(`Failed to read ${path}: ${error}`)
      return null
    }
  }

  validateCentralConfiguration(): void {
    logSection('Central Configuration Validation')
    
    try {
      const crossValidation = validateCrossConfiguration()
      
      if (crossValidation.valid) {
        logSuccess('Central configuration validation passed')
      } else {
        crossValidation.errors.forEach(error => {
          this.addIssue(`Central config error: ${error}`)
          logError(error)
        })
      }

      crossValidation.warnings.forEach(warning => {
        this.addWarning(warning)
        logWarning(warning)
      })

      // Validate configuration accessibility
      const appConfig = config.get('app')
      const buildConfig = config.get('build')
      const devConfig = config.get('development')
      
      logInfo(`Environment: ${appConfig.environment}`)
      logInfo(`Port: ${appConfig.port}`)
      logInfo(`Build output: ${buildConfig.clientOutDir} / ${buildConfig.serverOutDir}`)
      logInfo(`HMR: ${devConfig.hmr ? 'enabled' : 'disabled'}`)
      
    } catch (error) {
      this.addIssue(`Central configuration initialization failed: ${error}`)
      logError(`Central configuration failed: ${error}`)
    }
  }

  validateViteConfiguration(): void {
    logSection('Vite Configuration Integration')
    
    const viteConfigPath = join(this.projectRoot, 'vite.config.ts')
    
    if (!existsSync(viteConfigPath)) {
      this.addIssue('vite.config.ts not found')
      return
    }

    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8')
    
    // Check if using central config
    if (!viteConfigContent.includes("from './shared/config'")) {
      this.addIssue('vite.config.ts should import from central configuration')
    } else {
      logSuccess('Vite configuration uses central config')
    }

    // Validate configuration alignment
    try {
      const viteConfig = config.getViteConfig()
      const pathsConfig = config.get('paths')
      
      // Check if configuration is being applied
      if (viteConfigContent.includes('viteConfig.root')) {
        logSuccess('Vite root path configured from central config')
      }
      
      if (viteConfigContent.includes('pathsConfig.client')) {
        logSuccess('Vite aliases configured from central config')
      }
      
      logInfo(`Vite root: ${viteConfig.root}`)
      logInfo(`Vite proxy: ${Object.keys(viteConfig.server.proxy).join(', ')}`)
      
    } catch (error) {
      this.addIssue(`Vite config validation failed: ${error}`)
    }
  }

  validateTypeScriptConfiguration(): void {
    logSection('TypeScript Configuration Integration')
    
    const tsconfigPath = join(this.projectRoot, 'tsconfig.json')
    const tsconfig = this.readJsonFile(tsconfigPath)
    
    if (!tsconfig) return

    try {
      const centralTsPaths = config.getTypeScriptPaths()
      const tsPaths = tsconfig.compilerOptions?.paths || {}
      const tsBaseUrl = tsconfig.compilerOptions?.baseUrl || '.'
      
      // Validate base URL alignment
      if (tsBaseUrl === centralTsPaths.baseUrl) {
        logSuccess('TypeScript baseUrl aligned with central config')
      } else {
        this.addWarning(`TypeScript baseUrl (${tsBaseUrl}) differs from central config (${centralTsPaths.baseUrl})`)
      }
      
      // Validate path mappings
      const centralPaths = Object.keys(centralTsPaths.paths)
      const configPaths = Object.keys(tsPaths)
      
      const missingPaths = centralPaths.filter(path => !configPaths.includes(path))
      const extraPaths = configPaths.filter(path => !centralPaths.includes(path))
      
      if (missingPaths.length === 0 && extraPaths.length === 0) {
        logSuccess('TypeScript path mappings aligned with central config')
      } else {
        if (missingPaths.length > 0) {
          this.addIssue(`Missing TypeScript paths: ${missingPaths.join(', ')}`)
        }
        if (extraPaths.length > 0) {
          this.addWarning(`Extra TypeScript paths: ${extraPaths.join(', ')}`)
        }
      }
      
      // Validate include/exclude patterns
      const include = tsconfig.include || []
      const exclude = tsconfig.exclude || []
      
      logInfo(`TypeScript includes: ${include.length} patterns`)
      logInfo(`TypeScript excludes: ${exclude.length} patterns`)
      
      if (exclude.includes('coverage')) {
        logSuccess('TypeScript excludes coverage directory')
      } else {
        this.addRecommendation('Consider excluding coverage directory from TypeScript compilation')
      }
      
    } catch (error) {
      this.addIssue(`TypeScript config validation failed: ${error}`)
    }
  }

  validateViTestConfiguration(): void {
    logSection('Vitest Configuration Integration')
    
    const vitestConfigPath = join(this.projectRoot, 'vitest.config.ts')
    
    if (!existsSync(vitestConfigPath)) {
      this.addWarning('vitest.config.ts not found')
      return
    }

    const vitestConfigContent = readFileSync(vitestConfigPath, 'utf-8')
    
    try {
      const viteConfig = config.getViteConfig()
      
      // Check alias consistency
      if (vitestConfigContent.includes('resolve:') && vitestConfigContent.includes('alias:')) {
        logSuccess('Vitest has alias configuration')
        
        // Check if aliases match Vite config pattern
        const aliases = Object.keys(viteConfig.resolve.alias)
        let aliasesMatch = true
        
        aliases.forEach(alias => {
          if (!vitestConfigContent.includes(`'${alias}':`)) {
            this.addWarning(`Vitest missing alias: ${alias}`)
            aliasesMatch = false
          }
        })
        
        if (aliasesMatch) {
          logSuccess('Vitest aliases appear to be aligned with Vite config')
        }
      } else {
        this.addIssue('Vitest configuration missing alias setup')
      }
      
      // Check test environment
      if (vitestConfigContent.includes("environment: 'jsdom'")) {
        logSuccess('Vitest configured with jsdom environment for React testing')
      } else {
        this.addWarning('Vitest environment may not be configured for React components')
      }
      
    } catch (error) {
      this.addIssue(`Vitest config validation failed: ${error}`)
    }
  }

  validateESLintConfiguration(): void {
    logSection('ESLint Configuration Integration')
    
    const eslintConfigPath = join(this.projectRoot, 'eslint.config.js')
    
    if (!existsSync(eslintConfigPath)) {
      this.addIssue('eslint.config.js not found')
      return
    }

    const eslintConfigContent = readFileSync(eslintConfigPath, 'utf-8')
    
    try {
      const eslintConfig = config.getESLintConfig()
      
      // Check ignore patterns
      eslintConfig.ignorePatterns.forEach(pattern => {
        if (eslintConfigContent.includes(`'${pattern}'`)) {
          logSuccess(`ESLint ignores ${pattern}`)
        } else {
          this.addWarning(`ESLint may not ignore ${pattern}`)
        }
      })
      
      // Check TypeScript project service
      if (eslintConfigContent.includes('projectService: true')) {
        logSuccess('ESLint uses TypeScript project service')
      } else {
        this.addWarning('ESLint may not be using TypeScript project service')
      }
      
    } catch (error) {
      this.addIssue(`ESLint config validation failed: ${error}`)
    }
  }

  validatePackageJsonScripts(): void {
    logSection('Package.json Scripts Integration')
    
    const packageJsonPath = join(this.projectRoot, 'package.json')
    const packageJson = this.readJsonFile(packageJsonPath)
    
    if (!packageJson) return

    const scripts = packageJson.scripts || {}
    const appConfig = config.get('app')
    
    // Validate development script alignment
    if (scripts['dev:server']?.includes('--hot')) {
      logSuccess('Development server script includes hot reload')
    } else {
      this.addWarning('Development server script may not have hot reload enabled')
    }
    
    // Validate build script configuration
    if (scripts.build?.includes('--config vite.config.ts')) {
      logSuccess('Build script explicitly references vite.config.ts')
    } else {
      this.addRecommendation('Build script should explicitly reference vite.config.ts')
    }
    
    // Validate port consistency in scripts
    if (scripts['dev:server']?.includes(appConfig.port.toString())) {
      logSuccess(`Development server port (${appConfig.port}) is consistent`)
    } else {
      logInfo(`Note: Server port ${appConfig.port} may be environment-controlled`)
    }
    
    // Check for validation scripts
    const requiredScripts = ['env:validate', 'config:validate', 'check:all']
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        logSuccess(`Validation script '${script}' present`)
      } else {
        this.addRecommendation(`Consider adding '${script}' script for validation`)
      }
    })
  }

  validateDevelopmentWorkflow(): void {
    logSection('Development Workflow Integration')
    
    try {
      const devConfig = config.get('development')
      const appConfig = config.get('app')
      const securityConfig = config.get('security')
      
      // Validate proxy configuration
      if (devConfig.proxyPort === appConfig.port) {
        logSuccess('Development proxy port matches application port')
      } else {
        this.addIssue(`Proxy port (${devConfig.proxyPort}) does not match app port (${appConfig.port})`)
      }
      
      // Validate CORS configuration for development
      if (securityConfig.corsOrigins.includes('http://localhost:5173')) {
        logSuccess('CORS configured for Vite development server')
      } else {
        this.addWarning('CORS may not be configured for development')
      }
      
      // Validate hot reload configuration
      if (devConfig.hmr && config.isDevelopment()) {
        logSuccess('Hot module replacement enabled for development')
      }
      
      logInfo(`Watch paths: ${devConfig.watchPaths.join(', ')}`)
      logInfo(`Mock APIs: ${devConfig.mockApis ? 'enabled' : 'disabled'}`)
      
    } catch (error) {
      this.addIssue(`Development workflow validation failed: ${error}`)
    }
  }

  validateProductionReadiness(): void {
    logSection('Production Configuration Validation')
    
    try {
      const appConfig = config.get('app')
      const buildConfig = config.get('build')
      const securityConfig = config.get('security')
      const featuresConfig = config.get('features')
      
      if (appConfig.environment === 'production') {
        // Production-specific validations
        if (securityConfig.sessionSecret) {
          logSuccess('Session secret configured for production')
        } else {
          this.addIssue('Session secret required for production')
        }
        
        if (securityConfig.corsOrigins.length > 0 && 
            !securityConfig.corsOrigins.includes('http://localhost:5173')) {
          logSuccess('CORS origins configured for production')
        } else {
          this.addIssue('Production CORS origins not properly configured')
        }
        
        if (buildConfig.minify) {
          logSuccess('Build minification enabled for production')
        } else {
          this.addWarning('Build minification not enabled for production')
        }
        
        if (featuresConfig.ssr) {
          logSuccess('Server-side rendering enabled for production')
        } else {
          this.addRecommendation('Consider enabling SSR for production')
        }
      } else {
        logInfo('Production-specific validations skipped (not in production mode)')
      }
      
    } catch (error) {
      this.addIssue(`Production readiness validation failed: ${error}`)
    }
  }

  generateReport(): void {
    logSection('Configuration Integration Report')
    
    try {
      const report = generateConfigReport()
      console.log(report)
    } catch (error) {
      logError(`Report generation failed: ${error}`)
    }
  }

  async run(): Promise<void> {
    console.log(colorize('🚀 Starting Configuration Integration Validation...\\n', 'cyan'))

    this.validateCentralConfiguration()
    this.validateViteConfiguration()
    this.validateTypeScriptConfiguration()
    this.validateViTestConfiguration()
    this.validateESLintConfiguration()
    this.validatePackageJsonScripts()
    this.validateDevelopmentWorkflow()
    this.validateProductionReadiness()

    logSection('Validation Summary')
    
    if (this.result.valid) {
      logSuccess('All critical validations passed!')
    } else {
      logError(`Found ${this.result.issues.length} critical issues`)
      this.result.issues.forEach(issue => logError(issue))
    }
    
    if (this.result.warnings.length > 0) {
      logWarning(`Found ${this.result.warnings.length} warnings`)
      this.result.warnings.forEach(warning => logWarning(warning))
    }
    
    if (this.result.recommendations.length > 0) {
      logInfo(`${this.result.recommendations.length} recommendations`)
      this.result.recommendations.forEach(rec => logInfo(rec))
    }

    this.generateReport()

    if (!this.result.valid) {
      logError('Configuration integration validation failed')
      exit(1)
    } else {
      logSuccess('Configuration integration validation completed successfully')
    }
  }
}

// Run the validation
const validator = new ConfigurationIntegrationValidator()
await validator.run()