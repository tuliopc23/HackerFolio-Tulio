import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { config } from './shared/config'

export default defineConfig(({ command, mode }) => {
  const isSSR = process.argv.includes('--ssr')
  const isDev = command === 'serve'
  const isProd = mode === 'production'
  const viteConfig = config.getViteConfig()
  const pathsConfig = config.get('paths')
  const buildConfig = config.get('build')

  return {
    root: path.resolve(__dirname, viteConfig.root),
    plugins: [
      react({
        // Add React DevTools in development
        include: '**/*.{jsx,tsx}',
      }),
    ],
    css: {
      postcss: './postcss.config.js',
      devSourcemap: isDev,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, pathsConfig.client, 'src'),
        '@shared': path.resolve(__dirname, pathsConfig.shared),
        '@server': path.resolve(__dirname, pathsConfig.server),
      },
    },
    build: {
      outDir: isSSR
        ? path.resolve(__dirname, buildConfig.serverOutDir)
        : path.resolve(__dirname, buildConfig.clientOutDir),
      emptyOutDir: buildConfig.emptyOutDir,
      sourcemap: buildConfig.sourcemap,
      minify: buildConfig.minify,
      target: isSSR ? 'node18' : 'es2020',
      // Optimize chunk splitting for better caching
      rollupOptions: isSSR
        ? {
            input: path.resolve(__dirname, pathsConfig.client, 'src/entry-server.tsx'),
            output: {
              format: 'es' as const,
              entryFileNames: 'entry-server.js',
            },
            external: ['react', 'react-dom/server'],
            treeshake: {
              moduleSideEffects: false,
              propertyReadSideEffects: false,
              trySideEffects: false,
            },
          }
        : {
            output: {
              // Optimized vendor chunk splitting for better caching
              manualChunks: {
                // Core React (most stable, best caching)
                'react-core': ['react', 'react-dom'],
                // TanStack ecosystem (frequently updated together)
                'tanstack-router': ['@tanstack/react-router', '@tanstack/history'],
                'tanstack-query': ['@tanstack/react-query'],
                // Animation library (large, rarely changes)
                'motion-lib': ['motion'],
                // Database & validation (stable)
                'data-libs': ['drizzle-orm', 'drizzle-zod', 'zod'],
                // UI utilities (small, stable)
                'ui-utils': ['clsx', 'tailwind-merge'],
              },
            },
            treeshake: {
              moduleSideEffects: false,
              propertyReadSideEffects: false,
              trySideEffects: false,
            },
          },
      // Production optimizations
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    server: {
      ...viteConfig.server,
      open: isDev,
      cors: true,
      hmr: isDev
        ? {
            overlay: true,
          }
        : false,
    },
    preview: {
      port: 4173,
      host: true,
      cors: true,
    },
    optimizeDeps: {
      // OPTIMIZATION: Pre-bundle heavy dependencies for faster dev startup
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
      // OPTIMIZATION: Force optimization of problematic packages
      force: true,
    },
    // Environment variable handling
    define: {
      __DEV__: isDev,
      __PROD__: isProd,
    },
    // Asset handling
    assetsInclude: ['**/*.woff', '**/*.woff2'],
  }
})
