# Fix Asset Loading on Sevalla Deployment

## Why

The application builds correctly and runs locally in Docker (OrbStack), but when
deployed to Sevalla, the frontend fails to load with a white screen. Browser dev
tools show "This page failed to load a stylesheet from a URL" errors. The root
cause is that Vite generates asset paths without considering the production base
URL configuration, causing the server to serve static assets with incorrect
paths that the browser cannot resolve in the containerized Sevalla environment.

## What Changes

- **Vite Configuration:**
  - Add explicit `base: '/'` configuration to vite.config.ts for consistent
    asset path generation
  - Ensure proper manifest.json generation for SSR asset resolution
  - Configure build.manifest option to enable proper asset tracking in
    production

- **Server Asset Handling:**
  - Verify static asset serving correctly handles Vite's generated asset paths
  - Ensure proper MIME types and caching headers for all asset types
  - Add debug logging for asset resolution in production mode

- **Build Process:**
  - Verify dist/public directory structure matches server expectations
  - Ensure index.html references are correctly resolved in production

## Impact

- Affected specs: `build-system`, `deployment`
- Affected code:
  - `vite.config.ts` - Base URL and manifest configuration
  - `server/app.ts` - Asset serving logic (verification only)
  - `Dockerfile` - Build artifacts handling (verification only)
