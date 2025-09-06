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
              manualChunks: {
                'react-core': ['react', 'react-dom'],
                'tanstack-router': ['@tanstack/react-router', '@tanstack/history'],
                'tanstack-query': ['@tanstack/react-query'],
                'motion-lib': ['motion'],
                'data-libs': ['drizzle-orm', 'drizzle-zod', 'zod'],
                'ui-utils': ['clsx', 'tailwind-merge'],
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
