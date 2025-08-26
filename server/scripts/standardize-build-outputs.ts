#!/usr/bin/env bun
/**
 * Build Output Standardization Script
 *
 * This script ensures that all build-related tools output to consistent
 * directories as defined in the central configuration:
 * - Client build: dist/public
 * - Server build: dist/server
 * - Coverage: coverage/
 * - TypeScript: dist/ (outDir)
 */

import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { config } from '../../shared/config'

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

interface BuildOutputConfig {
  clientOutDir: string
  serverOutDir: string
  staticDir: string
  assetsDir: string
  coverageDir: string
  tempDir: string
}

class BuildOutputStandardizer {
  private projectRoot: string
  private buildConfig: BuildOutputConfig
  private issues: string[] = []
  private fixes: string[] = []

  constructor() {
    this.projectRoot = process.cwd()
    const centralBuildConfig = config.get('build')

    this.buildConfig = {
      clientOutDir: centralBuildConfig.clientOutDir,
      serverOutDir: centralBuildConfig.serverOutDir,
      staticDir: centralBuildConfig.staticDir,
      assetsDir: centralBuildConfig.assetsDir,
      coverageDir: 'coverage',
      tempDir: 'tmp',
    }
  }

  async validateAndStandardize(): Promise<void> {
    console.log(colorize('🚀 Starting Build Output Standardization...', 'cyan'))
    console.log('')

    // Show target configuration
    console.log(colorize('Target Build Configuration:', 'cyan'))
    Object.entries(this.buildConfig).forEach(([key, value]) => {
      console.log(colorize(`  ${key}: ${value}`, 'blue'))
    })
    console.log('')

    this.createBuildDirectories()
    this.validateViteBuildConfig()
    this.validateTypeScriptBuildConfig()
    this.validateVitestCoverageConfig()
    this.validatePackageJsonScripts()
    this.validateGitignorePatterns()
    this.cleanupOldBuildArtifacts()

    this.showSummary()
  }

  private createBuildDirectories(): void {
    console.log(colorize('📁 Creating/Validating Build Directories...', 'cyan'))

    const requiredDirs = [
      this.buildConfig.clientOutDir,
      this.buildConfig.serverOutDir,
      this.buildConfig.coverageDir,
      'dist',
      'database',
    ]

    requiredDirs.forEach(dir => {
      const fullPath = resolve(this.projectRoot, dir)
      if (!existsSync(fullPath)) {
        try {
          mkdirSync(fullPath, { recursive: true })
          console.log(colorize(`  ✓ Created directory: ${dir}`, 'green'))
          this.fixes.push(`Created build directory: ${dir}`)
        } catch (error) {
          console.log(colorize(`  ✗ Failed to create directory: ${dir} - ${error}`, 'red'))
          this.issues.push(`Failed to create directory: ${dir}`)
        }
      } else {
        console.log(colorize(`  ✓ Directory exists: ${dir}`, 'green'))
      }
    })
  }

  private validateViteBuildConfig(): void {
    console.log(colorize('🔧 Validating Vite Build Configuration...', 'cyan'))

    const viteConfigPath = join(this.projectRoot, 'vite.config.ts')

    if (!existsSync(viteConfigPath)) {
      this.issues.push('vite.config.ts not found')
      return
    }

    const content = readFileSync(viteConfigPath, 'utf-8')

    // Check if using central config
    if (content.includes("from './shared/config'")) {
      console.log(colorize('  ✓ Vite uses central build configuration', 'green'))
    } else {
      this.issues.push('Vite should use central build configuration')
    }

    // Check specific build outputs
    const expectedPatterns = [
      'buildConfig.clientOutDir',
      'buildConfig.serverOutDir',
      'buildConfig.sourcemap',
      'buildConfig.minify',
    ]

    expectedPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        console.log(colorize(`  ✓ Uses central config: ${pattern}`, 'green'))
      } else {
        this.issues.push(`Vite config missing central config usage for: ${pattern}`)
      }
    })
  }

  private validateTypeScriptBuildConfig(): void {
    console.log(colorize('📝 Validating TypeScript Build Configuration...', 'cyan'))

    const tsconfigPath = join(this.projectRoot, 'tsconfig.json')

    if (!existsSync(tsconfigPath)) {
      this.issues.push('tsconfig.json not found')
      return
    }

    try {
      const content = readFileSync(tsconfigPath, 'utf-8')
      const cleanContent = content.replace(/\/\/.*$/gm, '')
      const tsconfigRaw = JSON.parse(cleanContent)

      // Type guard for tsconfig structure
      const isValidTsConfig = (
        data: unknown
      ): data is { compilerOptions?: { outDir?: string }; exclude?: string[] } => {
        return typeof data === 'object' && data !== null
      }

      if (!isValidTsConfig(tsconfigRaw)) {
        this.issues.push('Invalid tsconfig.json structure')
        return
      }

      const tsconfig = tsconfigRaw
      const compilerOptions = tsconfig.compilerOptions || {}

      // Check outDir
      const expectedOutDir = './dist'
      if (compilerOptions.outDir === expectedOutDir) {
        console.log(colorize(`  ✓ TypeScript outDir: ${compilerOptions.outDir}`, 'green'))
      } else {
        this.issues.push(
          `TypeScript outDir should be "${expectedOutDir}", found "${compilerOptions.outDir}"`
        )
      }

      // Check include/exclude patterns
      const exclude = tsconfig.exclude || []
      const expectedExcludes = ['node_modules', 'dist', 'build', 'coverage']

      expectedExcludes.forEach(pattern => {
        if (exclude.includes(pattern)) {
          console.log(colorize(`  ✓ Excludes: ${pattern}`, 'green'))
        } else {
          this.issues.push(`TypeScript should exclude: ${pattern}`)
        }
      })
    } catch (error) {
      this.issues.push(`Failed to parse tsconfig.json: ${error}`)
    }
  }

  private validateVitestCoverageConfig(): void {
    console.log(colorize('🧪 Validating Vitest Coverage Configuration...', 'cyan'))

    const vitestConfigPath = join(this.projectRoot, 'vitest.config.ts')

    if (!existsSync(vitestConfigPath)) {
      this.issues.push('vitest.config.ts not found')
      return
    }

    const content = readFileSync(vitestConfigPath, 'utf-8')

    // Check coverage directory (should be default 'coverage')
    if (content.includes('coverage/')) {
      console.log(colorize('  ✓ Coverage directory configured', 'green'))
    }

    // Check exclude patterns
    const expectedExcludes = ['node_modules/', 'dist/', 'build/', 'coverage/', 'drizzle/**']

    expectedExcludes.forEach(pattern => {
      if (content.includes(`'${pattern}'`)) {
        console.log(colorize(`  ✓ Excludes: ${pattern}`, 'green'))
      } else {
        this.issues.push(`Vitest should exclude from coverage: ${pattern}`)
      }
    })
  }

  private validatePackageJsonScripts(): void {
    console.log(colorize('📦 Validating Package.json Build Scripts...', 'cyan'))

    const packageJsonPath = join(this.projectRoot, 'package.json')

    if (!existsSync(packageJsonPath)) {
      this.issues.push('package.json not found')
      return
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      // Type guard for package.json structure
      const isValidPackageJson = (data: unknown): data is { scripts?: Record<string, string> } => {
        return typeof data === 'object' && data !== null
      }

      if (!isValidPackageJson(packageJson)) {
        this.issues.push('Invalid package.json structure')
        return
      }

      const scripts = packageJson.scripts || {}

      // Check build script
      if (scripts.build?.includes('vite build')) {
        console.log(colorize('  ✓ Build script uses vite build', 'green'))
      } else {
        this.issues.push('Build script should use vite build with proper configuration')
      }

      // Check clean script
      if (scripts.clean || scripts['build:clean']) {
        console.log(colorize('  ✓ Has clean script', 'green'))
      } else {
        this.fixes.push('Consider adding clean script for build artifacts')
      }

      // Check if build script references config files
      if (scripts.build?.includes('--config')) {
        console.log(colorize('  ✓ Build script explicitly references config', 'green'))
      }
    } catch (error) {
      this.issues.push(`Failed to parse package.json: ${error}`)
    }
  }

  private validateGitignorePatterns(): void {
    console.log(colorize('📋 Validating .gitignore Build Patterns...', 'cyan'))

    const gitignorePath = join(this.projectRoot, '.gitignore')

    if (!existsSync(gitignorePath)) {
      this.issues.push('.gitignore not found')
      return
    }

    const content = readFileSync(gitignorePath, 'utf-8')

    const expectedPatterns = [
      'dist/',
      'build/',
      'coverage/',
      'node_modules/',
      '*.log',
      '.env',
      '.DS_Store',
    ]

    expectedPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        console.log(colorize(`  ✓ Ignores: ${pattern}`, 'green'))
      } else {
        this.issues.push(`Should ignore in .gitignore: ${pattern}`)
      }
    })
  }

  private cleanupOldBuildArtifacts(): void {
    console.log(colorize('🧹 Checking for Old Build Artifacts...', 'cyan'))

    // List of potential old build directories that might conflict
    const oldBuildDirs = ['build', 'out', 'lib', '.next', '.nuxt', 'public/dist']

    oldBuildDirs.forEach(dir => {
      const fullPath = resolve(this.projectRoot, dir)
      if (existsSync(fullPath) && dir !== 'build') {
        // 'build' might be legitimate
        console.log(colorize(`  ⚠ Found old build directory: ${dir}`, 'yellow'))
        this.fixes.push(`Consider cleaning up old build directory: ${dir}`)
      }
    })
  }

  private showSummary(): void {
    console.log(colorize('\n📊 Build Output Standardization Summary:', 'cyan'))

    if (this.issues.length === 0) {
      console.log(colorize('✅ All build outputs are properly standardized!', 'green'))
    } else {
      console.log(colorize(`❌ Found ${this.issues.length} issues:`, 'red'))
      this.issues.forEach(issue => {
        console.log(colorize(`  • ${issue}`, 'red'))
      })
    }

    if (this.fixes.length > 0) {
      console.log(colorize(`\n🔧 Applied ${this.fixes.length} fixes:`, 'green'))
      this.fixes.forEach(fix => {
        console.log(colorize(`  • ${fix}`, 'green'))
      })
    }

    // Show build directory structure
    console.log(colorize('\n📁 Standardized Build Structure:', 'cyan'))
    console.log(colorize(`  ${this.buildConfig.clientOutDir}/     # Client build output`, 'blue'))
    console.log(colorize(`  ${this.buildConfig.serverOutDir}/     # SSR build output`, 'blue'))
    console.log(colorize(`  ${this.buildConfig.coverageDir}/      # Test coverage reports`, 'blue'))
    console.log(colorize(`  database/         # SQLite database files`, 'blue'))
    console.log(colorize(`  tmp/              # Temporary build files`, 'blue'))
  }
}

// Execute the standardization
const standardizer = new BuildOutputStandardizer()
await standardizer.validateAndStandardize()
