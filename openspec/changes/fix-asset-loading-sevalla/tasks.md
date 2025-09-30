# Implementation Tasks

## 1. Configuration Updates

- [x] 1.1 Add `base: '/'` to vite.config.ts for explicit asset path control
- [x] 1.2 Enable `build.manifest` option for production builds
- [x] 1.3 Add proper `index.html` input configuration for client build
- [x] 1.4 Create pre-deployment verification script
- [x] 1.5 Update Dockerfile to run verification before startup
- [x] 1.6 Add debug logging to server asset serving

## 2. Testing

- [x] 2.1 Test local production build with `bun run build:production`
- [x] 2.2 Test verification script output
- [x] 2.3 Verify asset paths in generated dist/public/index.html
- [x] 2.4 Verify manifest.json is generated correctly
- [ ] 2.5 Test local Docker container build and run

## 3. Deployment Verification

- [ ] 3.1 Deploy to Sevalla and verify assets load correctly
- [ ] 3.2 Check Sevalla logs for verification script output
- [ ] 3.3 Check browser dev tools for CSS/JS loading errors
- [ ] 3.4 Verify all asset types (CSS, JS, fonts) load with correct MIME types
- [ ] 3.5 Test on multiple routes to ensure SPA routing works
