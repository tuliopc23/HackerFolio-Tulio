import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-config/setup-tests.ts'],
    globals: true,
    css: true,
    clearMocks: true,
    restoreMocks: true,

    // Test execution configuration
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 10000, // 10 seconds for hooks
    teardownTimeout: 10000,

    // Test isolation and performance
    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        minForks: 1,
        maxForks: 4,
      },
    },

    // File patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      clean: true,
      skipFull: false,

      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test-config/**',
        '**/test-utils/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'coverage/**',
        'drizzle/**',
        'server/db/migrate.ts', // Migration script
        'client/src/entry-*', // Entry points
        'server/scripts/**', // Build and development scripts
        'deployment/**', // Deployment configurations
      ],

      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Per-file thresholds for critical modules
        'client/src/components/**/*.{ts,tsx}': {
          branches: 85,
          functions: 85,
        },
        'server/lib/**/*.ts': {
          branches: 90,
          functions: 90,
        },
        'shared/**/*.ts': {
          branches: 85,
          functions: 85,
        },
      },
    },

    // Reporter configuration
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './coverage/junit-report.xml',
      json: './coverage/test-results.json',
    },

    // Watch mode configuration
    watch: false, // Disabled by default for CI
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@server': path.resolve(__dirname, 'server'),
      // Additional test-specific aliases
      '@test-utils': path.resolve(__dirname, 'client/src/test-utils'),
      '@test-config': path.resolve(__dirname, 'test-config'),
    },
  },

  // Optimize deps for testing
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
    ],
  },
})
