# Project Context

## Purpose

HackerFolio is a modern terminal-themed portfolio website that provides an
interactive command-line interface experience for showcasing projects, skills,
and professional information. Users can browse the portfolio, launch
desktop-like panels, and explore project metadata entirely through
terminal-style commands.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7 with SSR entry points
- **Router:** TanStack Router v1.132 with streaming-ready route loaders
- **Styling:** Tailwind CSS v4, CSS custom properties, PostCSS pipeline
- **Animation:** Motion (Framer Motion fork) for cursor, glow, scanline effects
- **Backend:** Elysia.js (Bun-based server) with REST endpoints on port 3001
- **Database:** Better-SQLite3 with Drizzle ORM and `drizzle-kit` migrations
- **State Management:** TanStack Query for server state + custom hooks
- **Testing:** Vitest 3, Testing Library, jsdom, custom render helpers
- **Tooling:** ESLint 9 + TypeScript ESLint, Prettier 3, Knip, Bun runtime 1.2+
- **Build/Deploy:** Vite builds static client assets; Bun serves SSR + API
- **Iconography:** Lucide React for UI controls, Simple Icons via
  `react-simple-icons` for brand marks, and hand-tuned inline SVG fallbacks in
  `client/src/components/icons` for legacy glyphs

## Development Workflow

- Entry point: `bun run dev` starts Bun API (`server/app.ts`) and Vite client
  with signal forwarding so `Ctrl+C` stops both.
- Vite dev server proxies `/api` requests to `http://localhost:3001`.
- Production build uses `bun run build` (CSR + SSR bundles) and
  `bun run start:production` to run the Elysia server.
- Primary environment variables: `PORT` (default `3001`) with Bun `.env`
  loading.
- Quality gate: `bun run check:all` executes type checks, lint, format, and
  tests.

## Project Conventions

### Code Style

- TypeScript strict mode enabled with `ts-reset` for safer built-ins.
- ESLint with TypeScript, React, hooks, import ordering, accessibility, and
  Prettier integration.
- Prettier 3 enforces formatting; no semicolons, 2-space indentation.
- Font system: SF Mono Powerline for terminal text, system sans-serif fallback
  for supporting UI.
- Theme relies on CSS custom properties defined in `client/src/index.css`.

### Directory Layout

- `client/` – React app; key folders `components/terminal`, `components/ui`,
  `hooks/`, `lib/`, `pages/`, `test-utils/`.
- `server/` – Bun + Elysia SSR/API with `routes/`, `middleware/`, `db/`,
  `utils/`.
- `database/` – SQLite database files for local development.
- `drizzle/` – Generated SQL migrations from `drizzle-kit`.
- `scripts/` – Automation scripts (deployment, post-build helpers).
- `openspec/` – Specs, proposals, and change history (this workflow).

### Color System (Current)

- **Cyan:** Primary interactive color (`#33b1ff` bright, `#82cfff` soft)
- **Green:** Terminal success/prompt color (`#42be65`)
- **Pink/Magenta:** Accent color (`#be95ff` bright, `#ff7eb6` soft)
- **Grayscale:** `#f2f4f8` (light text), `#393939` (borders/dividers), `#0a0a0a`
  (dark bg)
- ANSI color mappings for terminal output

### Architecture Patterns

- **Monorepo structure:** `client/`, `server/`, `database/`
- **SSR-ready:** Entry points for both client (`entry-client.tsx`) and server
  rendering (`entry-server.tsx`)
- **Component organization:** Terminal core under
  `client/src/components/terminal`, desktop chrome in `components/desktop`, UI
  primitives in `components/ui`, accessibility helpers in
  `components/accessibility`
- **Route structure:** File-based routes with TanStack Router + enhanced loader
  prefetching in `client/src/router-enhanced.tsx`
- **API routes:** REST endpoints under `/api` prefix defined in
  `server/routes/api.ts`, proxied via Vite in dev
- **Database schema:** Drizzle ORM models in `server/db/schema.ts` with
  migrations via `drizzle-kit`

### Iconography

- Lucide icons are wrapped via lightweight helpers in
  `client/src/components/icons` to standardize size, stroke, and animation
  hooks.
- Brand marks use `react-simple-icons` components; keep imports tree-shaken by
  re-exporting only the brands we ship.
- Terminal content stored in `database/portfolio.db` should reference icon keys,
  not emoji; application code resolves keys to Lucide or Simple Icons for
  consistency across UI and CLI responses.
- Favor 16px, 20px, or 24px frames with `currentColor` fills to match the
  terminal palette and respect theme overrides.

### Testing Strategy

- Unit tests with Vitest for components and utilities
- React Testing Library and custom render helpers in `client/src/test-utils`
- Accessibility tests using `@testing-library/jest-dom` matchers
- Server tests under `server/__tests__` cover API + SSR responders
- Test files colocated in `__tests__/` directories near subjects

### Git Workflow

- Main development on `main` branch
- Feature branches for significant changes
- Commit messages should be clear and descriptive
- Pre-deployment validation with full test suite

## Domain Context

This is a terminal-themed portfolio application that simulates a Unix-like
command-line interface. Users can interact with the portfolio through terminal
commands, view system information in styled panes, and navigate projects through
synthetic terminal windows. The aesthetic emphasizes retro computing (CRT
scanlines, phosphor glow) while maintaining modern web performance standards.

## Data Conventions

- Primary SQLite file lives at `database/portfolio.db` with WAL mode enabled
  (see `.db-wal`, `.db-shm`).
- Drizzle ORM models in `server/db/schema.ts` define `projects`,
  `terminal_commands`, and `portfolio_content` tables, with Zod schemas
  generated for request validation.
- Command templates support structured metadata (`templateVariables`,
  `argumentSchema`, `examples`, `aliases`) that power dynamic terminal output.
- Seed content mirrors production structure; avoid manual edits to the DB and
  prefer migrations or seed scripts.

## Important Constraints

- Must maintain terminal aesthetic and retro computing theme
- Performance: target 60fps animations and smooth command transitions
- Accessibility: keyboard navigation must work across terminal and overlays
- Color system must maintain sufficient contrast ratios (WCAG AA minimum)
- Typography must be readable at default browser font sizes
- No layout shifts or text overflow breaking card boundaries
- Works on desktop and mobile; terminal interactions degrade gracefully on touch

## External Dependencies

- **CSS Fonts:** SF Mono Powerline (local font files in
  `client/src/assets/fonts/`)
- **Icons:** Lucide React, `react-simple-icons` (Simple Icons), and legacy
  custom SVG set under `client/src/components/icons`; Boxicons remain in
  specimen assets only
- **Build Tools:** Vite, esbuild, Lightning CSS (platform-specific binaries)
- **Tailwind Plugins:** tailwindcss-animate, @tailwindcss/typography
- **Server Middleware:** `@elysiajs/cors`, custom logging middleware
