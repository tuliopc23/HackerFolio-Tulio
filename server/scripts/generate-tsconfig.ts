#!/usr/bin/env bun
/**
 * TypeScript Configuration Generator
 *
 * This script generates a TypeScript configuration that is perfectly aligned
 * with the central configuration system, ensuring 100% consistency across
 * all tools and environments.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { config } from '../../shared/config'

interface TSConfig {
  include: string[]
  exclude: string[]
  compilerOptions: Record<string, any>
  'ts-node'?: Record<string, any>
}

function generateTypeScriptConfig(): TSConfig {
  const buildConfig = config.get('build')
  const toolsConfig = config.get('tools')
  const isTest = config.isTest()
  const isProd = config.isProduction()

  return {
    include: ['client/src/**/*', 'shared/**/*', 'server/**/*', 'test-config/**/*', 'reset.d.ts'],
    exclude: [
      'node_modules',
      'build',
      'dist',
      'drizzle/**/*',
      'coverage',
      '.vite/**/*',
      'tmp/**/*',
    ],
    compilerOptions: {
      // Build options - aligned with central config
      incremental: true,
      tsBuildInfoFile: './node_modules/typescript/tsbuildinfo',
      noEmit: true,
      target: 'ES2022',
      module: 'ESNext',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      moduleDetection: 'force',

      // Bundler mode
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      verbatimModuleSyntax: false,

      // Language and Environment
      jsx: 'preserve',
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      useDefineForClassFields: true,

      // Type Checking - Strict Mode
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      useUnknownInCatchVariables: true,
      alwaysStrict: true,

      // Additional Checks - Environment specific
      noUnusedLocals: isProd,
      noUnusedParameters: isProd,
      exactOptionalPropertyTypes: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      noImplicitOverride: true,
      noPropertyAccessFromIndexSignature: false,

      // Emit - aligned with build config
      declaration: false,
      declarationMap: false,
      sourceMap: buildConfig.sourcemap,
      outDir: buildConfig.clientOutDir,
      removeComments: isProd,
      downlevelIteration: true,
      importHelpers: true,

      // Interop Constraints
      skipLibCheck: true,
      skipDefaultLibCheck: true,

      // Path mapping - from central config
      baseUrl: toolsConfig.typescript.baseUrl,
      paths: toolsConfig.typescript.paths,

      // Type definitions
      types: [
        'node',
        'vite/client',
        'bun',
        '@total-typescript/ts-reset',
        ...(isTest ? ['vitest/globals'] : []),
      ],
    },
    'ts-node': {
      esm: true,
    },
  }
}

function updateTSConfigFile(): void {
  const projectRoot = process.cwd()
  const tsconfigPath = join(projectRoot, 'tsconfig.json')

  try {
    // Generate new config
    const newConfig = generateTypeScriptConfig()

    // Create header comment explaining the generation
    const header = `/*
 * TypeScript Configuration
 *
 * This file is managed by the central configuration system.
 * To modify TypeScript settings, update shared/config.ts
 *
 * Generated: ${new Date().toISOString()}
 * Environment: ${config.get('app').environment}
 */
`

    // Convert to formatted JSON with comments
    const configJson = JSON.stringify(newConfig, null, 2)

    const finalContent = header + '\n' + configJson

    // Write the updated configuration
    writeFileSync(tsconfigPath, finalContent, 'utf-8')

    console.log('✅ TypeScript configuration updated successfully')
    console.log(`📍 Configuration aligned with environment: ${config.get('app').environment}`)
    console.log(`🔗 Path mappings: ${Object.keys(config.get('tools').typescript.paths).join(', ')}`)
  } catch (error) {
    console.error('❌ Failed to update TypeScript configuration:', error)
    process.exit(1)
  }
}

function validateTSConfigAlignment(): boolean {
  try {
    const tsconfigPath = join(process.cwd(), 'tsconfig.json')
    const currentConfigData: any = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
    const expectedConfig = generateTypeScriptConfig()

    // Check path mappings alignment
    const currentPaths = currentConfigData.compilerOptions?.paths || {}
    const expectedPaths = expectedConfig.compilerOptions.paths

    const pathsMatch = JSON.stringify(currentPaths) === JSON.stringify(expectedPaths)

    if (!pathsMatch) {
      console.log('⚠️  TypeScript paths not aligned with central config')
      console.log('Current paths:', currentPaths)
      console.log('Expected paths:', expectedPaths)
      return false
    }

    // Check base URL alignment
    const currentBaseUrl = currentConfigData.compilerOptions?.baseUrl
    const expectedBaseUrl = expectedConfig.compilerOptions.baseUrl

    if (currentBaseUrl !== expectedBaseUrl) {
      console.log('⚠️  TypeScript baseUrl not aligned with central config')
      console.log(`Current: ${currentBaseUrl}, Expected: ${expectedBaseUrl}`)
      return false
    }

    console.log('✅ TypeScript configuration is aligned with central config')
    return true
  } catch (error) {
    console.error('❌ Failed to validate TypeScript configuration:', error)
    return false
  }
}

// Main execution
if (process.argv.includes('--validate')) {
  const isValid = validateTSConfigAlignment()
  process.exit(isValid ? 0 : 1)
} else if (process.argv.includes('--update')) {
  updateTSConfigFile()
} else {
  console.log('TypeScript Configuration Generator')
  console.log('')
  console.log('Usage:')
  console.log(
    '  bun run server/scripts/generate-tsconfig.ts --validate    # Validate current config'
  )
  console.log('  bun run server/scripts/generate-tsconfig.ts --update      # Update tsconfig.json')
  console.log('')

  // Show current status
  const isValid = validateTSConfigAlignment()
  if (!isValid) {
    console.log('')
    console.log('Run with --update to align TypeScript configuration with central config')
  }
}
