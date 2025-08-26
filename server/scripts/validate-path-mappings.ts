#!/usr/bin/env bun
/**
 * Path Mapping Validation Script
 *
 * This script validates that path mappings are perfectly consistent across:
 * - TypeScript (tsconfig.json)
 * - Vite (vite.config.ts)
 * - Vitest (vitest.config.ts)
 * - ESLint (eslint.config.js)
 * - Central Configuration (shared/config.ts)
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

import { config } from '../../shared/config'

// ANSI color codes
const colors = {
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  cyan: '\\x1b[36m',
  reset: '\\x1b[0m',
  bold: '\\x1b[1m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

type PathMapping = Record<string, string | string[]>

interface ValidationResult {
  valid: boolean
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

class PathMappingValidator {
  private projectRoot: string
  private result: ValidationResult
  private centralPaths: PathMapping

  constructor() {
    this.projectRoot = process.cwd()
    this.result = {
      valid: true,
      issues: [],
      warnings: [],
      recommendations: [],
    }
    this.centralPaths = config.get('tools').typescript.paths
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

  validateTypeScriptPaths(): void {
    console.log(colorize('🔍 Validating TypeScript Path Mappings...', 'cyan'))

    const tsconfigPath = join(this.projectRoot, 'tsconfig.json')

    if (!existsSync(tsconfigPath)) {
      this.addIssue('tsconfig.json not found')
      return
    }

    try {
      const content = readFileSync(tsconfigPath, 'utf-8')
      // Remove comments for JSON parsing
      const cleanContent = content.replace(/\/\/.*$/gm, '')
      const tsconfigRaw = JSON.parse(cleanContent)

      // Type guard for TypeScript config
      const isTSConfig = (
        config: unknown
      ): config is {
        compilerOptions?: {
          paths?: Record<string, string[]>
          baseUrl?: string
        }
      } => {
        return typeof config === 'object' && config !== null
      }

      if (!isTSConfig(tsconfigRaw)) {
        this.addIssue('Invalid tsconfig.json structure')
        return
      }

      // Type assertion with validation
      const tsconfig = tsconfigRaw as {
        compilerOptions?: {
          paths?: Record<string, string[]>
          baseUrl?: string
        }
      }

      const tsPaths = tsconfig.compilerOptions?.paths || {}
      const tsBaseUrl = tsconfig.compilerOptions?.baseUrl || '.'

      // Validate base URL
      const expectedBaseUrl = config.get('tools').typescript.baseUrl
      if (tsBaseUrl !== expectedBaseUrl) {
        this.addIssue(
          `TypeScript baseUrl mismatch: found "${tsBaseUrl}", expected "${expectedBaseUrl}"`
        )
      } else {
        console.log(colorize('  ✓ BaseUrl aligned', 'green'))
      }

      // Validate path mappings
      this.validatePathMappings('TypeScript', tsPaths, this.centralPaths)
    } catch (error) {
      this.addIssue(`Failed to parse tsconfig.json: ${error}`)
    }
  }

  validateVitePaths(): void {
    console.log(colorize('🔍 Validating Vite Path Mappings...', 'cyan'))

    const viteConfigPath = join(this.projectRoot, 'vite.config.ts')

    if (!existsSync(viteConfigPath)) {
      this.addIssue('vite.config.ts not found')
      return
    }

    const content = readFileSync(viteConfigPath, 'utf-8')

    // Check if using central config
    if (!content.includes("from './shared/config'")) {
      this.addIssue('Vite configuration should import from central config')
      return
    }

    // Extract alias configuration (simplified parsing)
    const viteAliases = config.getViteConfig().resolve.alias

    // Convert to TypeScript-style paths for comparison
    const vitePaths: PathMapping = {}
    Object.entries(viteAliases).forEach(([alias, path]) => {
      vitePaths[alias + '/*'] = [path + '/*']
    })

    this.validatePathMappings('Vite', vitePaths, this.centralPaths)
    console.log(colorize('  ✓ Vite uses central configuration', 'green'))
  }

  validateVitestPaths(): void {
    console.log(colorize('🔍 Validating Vitest Path Mappings...', 'cyan'))

    const vitestConfigPath = join(this.projectRoot, 'vitest.config.ts')

    if (!existsSync(vitestConfigPath)) {
      this.addWarning('vitest.config.ts not found')
      return
    }

    const content = readFileSync(vitestConfigPath, 'utf-8')

    // Check if using central config
    if (!content.includes("from './shared/config'")) {
      this.addIssue('Vitest configuration should import from central config')
      return
    }

    if (content.includes('config.getViteConfig().resolve.alias')) {
      console.log(colorize('  ✓ Vitest uses central configuration aliases', 'green'))
    } else {
      this.addWarning('Vitest may not be using central configuration aliases')
    }
  }

  validateESLintPaths(): void {
    console.log(colorize('🔍 Validating ESLint Path Resolution...', 'cyan'))

    const eslintConfigPath = join(this.projectRoot, 'eslint.config.js')

    if (!existsSync(eslintConfigPath)) {
      this.addIssue('eslint.config.js not found')
      return
    }

    const content = readFileSync(eslintConfigPath, 'utf-8')

    // Check TypeScript resolver configuration
    if (content.includes('eslint-import-resolver-typescript')) {
      console.log(colorize('  ✓ ESLint has TypeScript import resolver', 'green'))
    } else {
      this.addWarning('ESLint should use TypeScript import resolver for path mappings')
    }

    // Check if it references TypeScript config
    if (content.includes('tsconfig') || content.includes('project:')) {
      console.log(colorize('  ✓ ESLint references TypeScript configuration', 'green'))
    } else {
      this.addWarning('ESLint should reference TypeScript project for path resolution')
    }
  }

  private validatePathMappings(
    tool: string,
    actualPaths: PathMapping,
    expectedPaths: PathMapping
  ): void {
    const actualAliases = Object.keys(actualPaths).sort()
    const expectedAliases = Object.keys(expectedPaths).sort()

    // Check for missing aliases
    const missingAliases = expectedAliases.filter(alias => !actualAliases.includes(alias))
    if (missingAliases.length > 0) {
      this.addIssue(`${tool} missing path aliases: ${missingAliases.join(', ')}`)
    }

    // Check for extra aliases
    const extraAliases = actualAliases.filter(alias => !expectedAliases.includes(alias))
    if (extraAliases.length > 0) {
      this.addWarning(`${tool} has extra path aliases: ${extraAliases.join(', ')}`)
    }

    // Check path resolution for common aliases
    expectedAliases.forEach(alias => {
      if (actualPaths[alias]) {
        const actualPath = Array.isArray(actualPaths[alias])
          ? actualPaths[alias][0]
          : actualPaths[alias]
        const expectedPath = Array.isArray(expectedPaths[alias])
          ? expectedPaths[alias][0]
          : expectedPaths[alias]

        if (actualPath !== expectedPath) {
          this.addIssue(
            `${tool} path mismatch for ${alias}: found "${actualPath}", expected "${expectedPath}"`
          )
        } else {
          console.log(colorize(`  ✓ ${alias} → ${actualPath}`, 'green'))
        }
      }
    })

    if (missingAliases.length === 0 && actualAliases.length === expectedAliases.length) {
      console.log(colorize(`  ✓ ${tool} path mappings complete`, 'green'))
    }
  }

  validateActualPathResolution(): void {
    console.log(colorize('🔍 Validating Actual Path Resolution...', 'cyan'))

    // Test that key paths actually exist
    const pathsConfig = config.get('paths')
    const testPaths = [
      { alias: '@', path: pathsConfig.client + '/src' },
      { alias: '@shared', path: pathsConfig.shared },
      { alias: '@server', path: pathsConfig.server },
    ]

    testPaths.forEach(({ alias, path }) => {
      const fullPath = resolve(this.projectRoot, path)
      if (existsSync(fullPath)) {
        console.log(colorize(`  ✓ ${alias} resolves to existing directory: ${path}`, 'green'))
      } else {
        this.addIssue(`Path alias ${alias} points to non-existent directory: ${path}`)
      }
    })
  }

  validateImportConsistency(): void {
    console.log(colorize('🔍 Validating Import Usage Consistency...', 'cyan'))

    // Check some key files for proper import usage
    const testFiles = ['client/src/App.tsx', 'server/app.ts', 'shared/config.ts']

    testFiles.forEach(file => {
      const filePath = join(this.projectRoot, file)
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')

        // Check for relative imports that could use aliases
        const relativeImports = content.match(/from ['"]\.[.\/].*['"]/g) || []
        const aliasImports = content.match(/from ['"]@[^'"]*['"]/g) || []

        if (relativeImports.length > 0 && aliasImports.length === 0) {
          this.addRecommendation(`${file} could use path aliases instead of relative imports`)
        } else if (aliasImports.length > 0) {
          console.log(colorize(`  ✓ ${file} uses path aliases`, 'green'))
        }
      }
    })
  }

  generateFixReport(): void {
    if (this.result.issues.length > 0) {
      console.log(colorize('\\n🔧 Suggested Fixes:', 'yellow'))

      this.result.issues.forEach(issue => {
        console.log(colorize(`  • ${issue}`, 'red'))

        // Provide specific fix suggestions
        if (issue.includes('TypeScript baseUrl')) {
          console.log(
            colorize('    → Run: bun run server/scripts/generate-tsconfig.ts --update', 'blue')
          )
        }

        if (issue.includes('Vite configuration should import')) {
          console.log(
            colorize('    → Update vite.config.ts to import from ./shared/config', 'blue')
          )
        }

        if (issue.includes('Vitest configuration should import')) {
          console.log(
            colorize('    → Update vitest.config.ts to import from ./shared/config', 'blue')
          )
        }
      })
    }

    if (this.result.recommendations.length > 0) {
      console.log(colorize('\\n💡 Recommendations:', 'cyan'))
      this.result.recommendations.forEach(rec => {
        console.log(colorize(`  • ${rec}`, 'blue'))
      })
    }
  }

  async run(): Promise<void> {
    console.log(colorize('🚀 Starting Path Mapping Validation...\\n', 'cyan'))

    // Show central configuration
    console.log(colorize('Central Configuration Paths:', 'cyan'))
    Object.entries(this.centralPaths).forEach(([alias, path]) => {
      const pathStr = Array.isArray(path) ? path[0] : path
      console.log(colorize(`  ${alias} → ${pathStr}`, 'blue'))
    })
    console.log('')

    this.validateTypeScriptPaths()
    this.validateVitePaths()
    this.validateVitestPaths()
    this.validateESLintPaths()
    this.validateActualPathResolution()
    this.validateImportConsistency()

    console.log(colorize('\\n📊 Validation Summary:', 'cyan'))

    if (this.result.valid) {
      console.log(colorize('✅ All path mappings are properly aligned!', 'green'))
    } else {
      console.log(colorize(`❌ Found ${this.result.issues.length} critical issues`, 'red'))
    }

    if (this.result.warnings.length > 0) {
      console.log(colorize(`⚠️  ${this.result.warnings.length} warnings`, 'yellow'))
    }

    this.generateFixReport()

    if (!this.result.valid) {
      process.exit(1)
    }
  }
}

// Run the validation
const validator = new PathMappingValidator()
await validator.run()
