# Build System Spec Delta

## MODIFIED Requirements

### Requirement: Vite Production Build Configuration

The build system SHALL configure Vite to generate production-ready assets with explicit base URL configuration to ensure proper asset resolution in containerized deployments. The configuration MUST include:
- Explicit `base: '/'` setting for consistent root-relative asset paths
- `build.manifest: true` to generate manifest.json for SSR asset tracking
- Proper `index.html` input configuration for the client build
- Separate client and SSR build outputs

#### Scenario: Production build generates correct asset paths

- **GIVEN** the application is being built for production
- **WHEN** `bun run build:production` is executed
- **THEN** the generated `dist/public/index.html` SHALL contain root-relative asset paths starting with `/assets/`
- **AND** a `dist/public/.vite/manifest.json` file SHALL be generated with asset mapping
- **AND** all CSS and JavaScript files SHALL be placed in `dist/public/assets/` directory

#### Scenario: Assets load correctly in containerized environment

- **GIVEN** the application is deployed to a containerized platform (Sevalla)
- **WHEN** a user visits the application URL
- **THEN** all stylesheets SHALL load without CORS or path resolution errors
- **AND** all JavaScript bundles SHALL load and execute correctly
- **AND** the browser console SHALL show no 404 errors for assets
- **AND** the page SHALL render the full application UI (not a white screen)

#### Scenario: Local Docker build matches production

- **GIVEN** the Dockerfile builds the application
- **WHEN** the container is run locally (e.g., via OrbStack)
- **THEN** the asset loading behavior SHALL match the Sevalla deployment
- **AND** the same asset paths SHALL be used in both environments
- **AND** the application SHALL function identically in local and production containers
