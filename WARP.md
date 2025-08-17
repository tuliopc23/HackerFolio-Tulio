# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview

- Monorepo-style layout (single package):
  - server/: Express HTTP server with Vite integration for dev and static serving for prod
  - client/: React + Vite SPA (wouter for routing) with a terminal-style UI
  - shared/: Type-safe schemas and types (Drizzle + Zod) shared between server and client
- Package manager: no lockfile found; default to npm unless the user specifies otherwise

Common commands (fish-safe via npm scripts)

- Install deps: npm install
- Start dev server (Express + Vite HMR on the same process): npm run dev
  - Script sets NODE_ENV=development internally; running through npm avoids fish env syntax issues
- Type check: npm run check
- Build (client + server bundle): npm run build
  - Outputs client to dist/public and bundles server to dist/index.js (ESM)
- Start production build: npm run start
  - Requires prior build; serves API and static client on PORT (default 5000)
- Database schema push: npm run db:push
  - Uses drizzle-kit push; requires proper drizzle config and DATABASE_URL

What’s not configured (as of now)

- Linting: no ESLint config or npm script present
- Testing: no test framework or scripts present (e.g., Vitest/Jest). Running a single test is not applicable yet

Architecture and flow

- Server (Express)
  - Entry: server/index.ts
  - Middleware: JSON/urlencoded; request logger for /api routes with compact log lines
  - Routing: server/routes.ts
    - /api/health: health check (status, ISO timestamp, uptime)
    - /api/profile: placeholder profile data
    - /api/projects: placeholder project list
    - POST /api/terminal/log: optional analytics hook
  - Dev vs Prod integration (server/vite.ts)
    - Development: setupVite attaches Vite as middleware (middlewareMode) and wires HMR to the same HTTP server
    - Production: serveStatic() serves dist/public via express.static; "\*" falls back to index.html (SPA routing)
  - Port: process.env.PORT or 5000 by default; listens on 0.0.0.0

- Client (React + Vite)
  - Entry HTML: client/index.html (mounts #root and loads /src/main.tsx)
  - Entry TSX: client/src/main.tsx renders <App />
  - App shell: client/src/App.tsx
    - Providers: TanStack Query (QueryClientProvider), ThemeProvider, TooltipProvider, Toaster
    - Routing: wouter <Switch>/<Route> with routes: /, /projects, /about, /contact, /resume, fallback not-found
  - Data fetching: client/src/lib/queryClient.ts
    - queryClient with custom getQueryFn that fetches using queryKey.join("/") and returns JSON
    - credentials: "include"; default behavior: no retries, staleTime Infinity, no window refetch
  - Terminal UI: client/src/components/terminal/\*
    - terminal-pane.tsx: interactive command input, history, autocomplete, navigation (wouter) and theme changes

- Shared types and DB schemas (shared/schema.ts)
  - Drizzle Postgres table definitions for users, projects, and portfolio_content
  - Zod insert schemas via drizzle-zod; exported TS types for both select and insert shapes
  - Not yet wired to persistent storage in routes; server/storage.ts provides an in-memory storage example

Configuration and conventions

- Path aliases (vite.config.ts and tsconfig.json)
  - @ -> client/src
  - @shared -> shared
  - @assets -> attached_assets (ensure folder exists if you rely on this)
- Build output
  - Client build to dist/public (vite)
  - Server bundle to dist/index.js (esbuild)
- Environment variables
  - PORT: controls server listen port (defaults to 5000); set before npm run start
  - DATABASE_URL (expected when using drizzle-kit db:push)
  - No .env file present in repo; add one if needed and avoid inlining secrets in commands

How to develop efficiently

- Single-process dev: npm run dev starts Express and attaches Vite middleware (no need to run Vite separately)
- API prefix: /api (keep client-side fetches relative to the same origin to avoid CORS in dev)
- SPA routing: fallback to index.html in prod; client-side navigation is handled by wouter

Important notes from repo meta files

- README.md, CLAUDE/Cursor/Copilot rules: none found in this repository at time of writing

Potential improvements (non-breaking, opt-in)

- Linting: add ESLint + @typescript-eslint and a lint script (npm run lint); use latest stable packages
- Testing: add Vitest + React Testing Library with scripts:
  - test: "vitest"
  - test:watch: "vitest --watch"
  - Example single test (once configured): npm run test -- path/to/file.test.ts
- Drizzle config: add drizzle.config.ts (latest drizzle-kit) and .env with DATABASE_URL to make db:push actionable
- Pre-commit: add lint-staged + simple pre-commit hooks once lint/test are in place

Open questions for maintainers

- Preferred package manager (npm assumed due to no lockfile)
- Should I scaffold ESLint/Prettier/Vitest with latest stable versions?
- Do you want drizzle configured now (drizzle.config.ts + migrations strategy)?
