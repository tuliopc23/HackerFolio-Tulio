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
          }
        : {
            output: {
              manualChunks: {
                vendor: ['react', 'react-dom'],
                router: ['@tanstack/react-router'],
                icons: ['@tabler/icons-react', 'lucide-react'],
              },
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
      include: ['react', 'react-dom', '@tanstack/react-router', 'motion', 'clsx', 'tailwind-merge'],
      exclude: ['@server'],
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
