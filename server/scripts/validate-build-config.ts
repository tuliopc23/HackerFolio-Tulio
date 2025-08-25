#!/usr/bin/env bun
/**
 * Build Configuration Validation Script
 * 
 * This script validates that all build-related configurations are properly aligned:
 * - package.json scripts reference correct paths and configs
 * - vite.config.ts settings match expected build outputs
 * - Server app.ts expects SSR bundle in correct location
 * - Development server proxy settings are consistent
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { exit } from 'node:process'

interface ValidationResult {
  valid: boolean
  issues: string[]
  warnings: string[]
}

class BuildConfigValidator {
  private projectRoot: string
  private result: ValidationResult

  constructor() {
    this.projectRoot = resolve(__dirname, '../..')
    this.result = {
      valid: true,
      issues: [],
      warnings: []
    }
  }

  private addIssue(message: string): void {
    this.result.issues.push(message)
    this.result.valid = false
  }

  private addWarning(message: string): void {
    this.result.warnings.push(message)
  }

  private readJsonFile(path: string): any {
    try {
      return JSON.parse(readFileSync(path, 'utf-8'))
    } catch (error) {
      this.addIssue(`Failed to read ${path}: ${error}`)
      return null
    }
  }

  validatePackageJsonScripts(): void {
    console.log('🔍 Validating package.json scripts...')
    
    const packageJsonPath = join(this.projectRoot, 'package.json')
    const packageJson = this.readJsonFile(packageJsonPath)
    
    if (!packageJson) return

    const scripts = packageJson.scripts || {}

    // Check dev:client script
    if (!scripts['dev:client']?.includes('--config vite.config.ts')) {
      this.addIssue('dev:client script should explicitly reference vite.config.ts')
    }

    // Check build script
    const buildScript = scripts.build || ''
    if (!buildScript.includes('--config vite.config.ts')) {
      this.addIssue('build script should explicitly reference vite.config.ts for both builds')
    }

    if (buildScript.includes('src/entry-server.tsx') && !buildScript.includes('client/src/entry-server.tsx')) {
      this.addIssue('build script references wrong SSR entry path (should be relative to vite root)')
    }

    if (buildScript.includes('../dist/server')) {
      this.addIssue('build script uses relative path ../dist/server which can be fragile')
    }

    console.log('✅ Package.json scripts validation complete')
  }

  validateViteConfig(): void {
    console.log('🔍 Validating vite.config.ts...')
    
    const viteConfigPath = join(this.projectRoot, 'vite.config.ts')
    
    if (!existsSync(viteConfigPath)) {
      this.addIssue('vite.config.ts not found in project root')
      return
    }

    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8')

    // Check if config uses functional form for SSR handling
    if (!viteConfigContent.includes('defineConfig(({')) {
      this.addWarning('vite.config.ts should use functional form to handle SSR builds differently')
    }

    // Check if root is set to client directory
    if (!viteConfigContent.includes("root: path.resolve(__dirname, 'client')")) {
      this.addIssue('vite.config.ts should set root to client directory')
    }

    // Check aliases
    const requiredAliases = ['@', '@shared', '@server']
    for (const alias of requiredAliases) {
      if (!viteConfigContent.includes(`'${alias}':`)) {
        this.addIssue(`vite.config.ts missing alias: ${alias}`)
      }
    }

    console.log('✅ Vite config validation complete')
  }

  validateFileStructure(): void {
    console.log('🔍 Validating file structure...')
    
    const requiredFiles = [
      'client/src/entry-server.tsx',
      'client/src/entry-client.tsx', 
      'server/app.ts',
      'vite.config.ts',
      'package.json'
    ]

    for (const file of requiredFiles) {
      const filePath = join(this.projectRoot, file)
      if (!existsSync(filePath)) {
        this.addIssue(`Required file missing: ${file}`)
      }
    }

    console.log('✅ File structure validation complete')
  }

  validateBuildOutputs(): void {
    console.log('🔍 Validating expected build outputs...')
    
    // Check if dist directories would be created correctly
    const expectedDirs = [
      'dist/public', // Client build output
      'dist/server'  // SSR build output
    ]

    // We can't validate actual build outputs without building,
    // but we can validate the configuration points to correct paths
    const serverAppPath = join(this.projectRoot, 'server/app.ts')
    if (existsSync(serverAppPath)) {
      const serverContent = readFileSync(serverAppPath, 'utf-8')
      
      if (!serverContent.includes("'../dist/server/entry-server.js'")) {
        this.addWarning('server/app.ts should import SSR bundle from ../dist/server/entry-server.js')
      }

      if (!serverContent.includes("'./dist/public'")) {
        this.addWarning('server/app.ts should serve static files from ./dist/public')
      }
    }

    console.log('✅ Build outputs validation complete')
  }

  validateDevelopmentSetup(): void {
    console.log('🔍 Validating development setup...')
    
    const viteConfigPath = join(this.projectRoot, 'vite.config.ts')
    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8')

    // Check proxy configuration
    if (!viteConfigContent.includes("'/api'") || !viteConfigContent.includes('3001')) {
      this.addIssue('vite.config.ts should proxy /api to port 3001')
    }

    const packageJsonPath = join(this.projectRoot, 'package.json')
    const packageJson = this.readJsonFile(packageJsonPath)
    
    // Check if server env defaults to 3001 (should match proxy)
    const serverEnvPath = join(this.projectRoot, 'server/lib/validation.ts')
    if (existsSync(serverEnvPath)) {
      const serverEnvContent = readFileSync(serverEnvPath, 'utf-8')
      if (serverEnvContent.includes('PORT: z.coerce.number().default(3001)')) {
        console.log('  ✓ Development server ports aligned (defaults to 3001)')
      } else {
        this.addWarning('Server PORT should default to 3001 to match vite proxy')
      }
    } else {
      this.addWarning('Cannot validate server port configuration - validation file not found')
    }

    console.log('✅ Development setup validation complete')
  }

  async run(): Promise<void> {
    console.log('🚀 Starting build configuration validation...\n')

    this.validatePackageJsonScripts()
    this.validateViteConfig()
    this.validateFileStructure()
    this.validateBuildOutputs()
    this.validateDevelopmentSetup()

    console.log('\n📊 Validation Results:')
    console.log('=' .repeat(50))

    if (this.result.issues.length === 0) {
      console.log('✅ All validations passed!')
    } else {
      console.log(`❌ Found ${this.result.issues.length} issue(s):`)
      this.result.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
    }

    if (this.result.warnings.length > 0) {
      console.log(`\n⚠️  Found ${this.result.warnings.length} warning(s):`)
      this.result.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`)
      })
    }

    if (!this.result.valid) {
      console.log('\n💡 Recommendations:')
      console.log('   1. Run the build configuration fixes')
      console.log('   2. Ensure all scripts reference vite.config.ts explicitly')
      console.log('   3. Use consistent paths throughout the configuration')
      console.log('   4. Test both development and build processes')
      
      exit(1)
    }

    console.log('\n🎉 Build configuration is properly aligned!')
  }
}

// Run validation if called directly
if (import.meta.main) {
  const validator = new BuildConfigValidator()
  await validator.run()
}

export { BuildConfigValidator }