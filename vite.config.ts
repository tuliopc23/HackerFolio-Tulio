import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig(({ command, mode }) => {
  const isSSR = process.argv.includes('--ssr')
  const isDev = command === 'serve'
  const isProd = mode === 'production'

  return {
    root: path.resolve(__dirname, 'client'),
    plugins: [
      react({
        include: '**/*.{jsx,tsx}',
      }),
    ],
    css: {
      postcss: './postcss.config.js',
      devSourcemap: isDev,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@server': path.resolve(__dirname, 'server'),
      },
    },
    build: {
      outDir: isSSR
        ? path.resolve(__dirname, 'dist/server')
        : path.resolve(__dirname, 'dist/public'),
      emptyOutDir: true,
      sourcemap: isDev,
      minify: isProd,
      target: isSSR ? 'node18' : 'es2020',
      rollupOptions: isSSR
        ? {
            input: path.resolve(__dirname, 'client/src/entry-server.tsx'),
            output: {
              format: 'es' as const,
              entryFileNames: 'entry-server.js',
            },
            external: ['react', 'react-dom/server'],
          }
        : {
            output: {
              manualChunks: id => {
                // Core React libraries
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-core'
                }

                // TanStack Router and related
                if (id.includes('@tanstack/react-router') || id.includes('@tanstack/history')) {
                  return 'tanstack-router'
                }

                // TanStack Query
                if (id.includes('@tanstack/react-query')) {
                  return 'tanstack-query'
                }

                // Router DevTools (separate chunk for dev)
                if (id.includes('@tanstack/react-router-devtools')) {
                  return 'router-devtools'
                }

                // Motion library
                if (id.includes('motion')) {
                  return 'motion-lib'
                }

                // Database and validation libraries
                if (
                  id.includes('drizzle-orm') ||
                  id.includes('drizzle-zod') ||
                  id.includes('zod')
                ) {
                  return 'data-libs'
                }

                // UI utilities
                if (id.includes('clsx') || id.includes('tailwind-merge')) {
                  return 'ui-utils'
                }

                // Route-based chunks for pages
                if (id.includes('/pages/projects')) {
                  return 'page-projects'
                }

                if (id.includes('/pages/not-found')) {
                  return 'page-not-found'
                }

                if (id.includes('TerminalThemePreview')) {
                  return 'component-theme-preview'
                }

                // Terminal components (group related components)
                if (id.includes('/components/terminal/')) {
                  return 'terminal-components'
                }

                // Accessibility components
                if (id.includes('/components/accessibility/')) {
                  return 'accessibility-components'
                }

                // Node modules vendor chunk
                if (id.includes('node_modules')) {
                  return 'vendor'
                }
              },
            },
          },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      open: isDev,
      cors: true,
      hmr: isDev,
    },
    preview: {
      port: 4173,
      host: true,
      cors: true,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        '@tanstack/react-query',
        'motion',
        'clsx',
        'tailwind-merge',
        'drizzle-orm',
        'zod',
      ],
      exclude: ['@server'],
    },
    define: {
      __DEV__: isDev,
      __PROD__: isProd,
    },
    assetsInclude: ['**/*.woff', '**/*.woff2'],
  }
})
