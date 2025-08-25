import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { config } from './shared/config'

export default defineConfig(({ command, mode, ssrBuild }) => {
  const isSSR = ssrBuild || process.argv.includes('--ssr')
  const viteConfig = config.getViteConfig()
  const pathsConfig = config.get('paths')
  const buildConfig = config.get('build')
  
  return {
    root: path.resolve(__dirname, viteConfig.root),
    plugins: [react()],
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
      rollupOptions: isSSR ? {
        input: path.resolve(__dirname, pathsConfig.client, 'src/entry-server.tsx'),
        output: {
          format: 'es',
          entryFileNames: 'entry-server.js',
        },
        external: ['react', 'react-dom/server'],
      } : undefined,
    },
    server: viteConfig.server,
  }
})
