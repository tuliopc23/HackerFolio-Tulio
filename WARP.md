# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this
repository.

## Commands

### Development

```fish
bun run dev                     # Start dev servers (Bun API + Vite client, both on port 3001/5173)
bun run build:production        # Build for production (CLIENT + SSR bundles)
bun run start:production        # Start production server
```

### Testing & Quality

```fish
bun run test                    # Run all tests with Vitest
bun run test -- path/to/test    # Run specific test file

bun run check:all               # Run all checks (types, lint, format, tests)
bun run check:types             # TypeScript type check only
bun run check:lint              # ESLint check only
bun run check:format            # Prettier format check only

bun run fix:all                 # Auto-fix formatting and linting
bun run fix:lint                # Auto-fix linting issues
bun run fix:format              # Auto-fix formatting issues
```

### Database

```fish
bunx drizzle-kit generate       # Generate migrations from schema changes
bunx drizzle-kit migrate        # Apply pending migrations
bunx drizzle-kit studio         # Open Drizzle Studio to view/edit database
```

### Cloudflare Deployment

```fish
bun run cf:dev                  # Run Cloudflare Workers dev server
bun run cf:deploy               # Deploy to Cloudflare Workers
```

## Architecture

### Monorepo Structure

This is a full-stack TypeScript monorepo with three main directories:

- `client/` - React 19 frontend with Vite 7
- `server/` - Bun-based backend with Elysia.js REST API
- `database/` - SQLite database files (development)

### Path Aliases

The project uses three path aliases defined in both `tsconfig.json` and
`vite.config.ts`:

- `@/*` → `client/src/*` (client code)
- `@server/*` → `server/*` (server code)
- `shared/*` → `shared/*` (shared utilities - currently empty)

Always use these aliases when importing across boundaries.

### Development Flow

In development, two servers run simultaneously via `bun run dev`:

1. **Vite dev server** on port 5173 (client hot reload)
2. **Bun API server** on port 3001 (Elysia.js backend)
3. Vite proxies `/api` requests to `http://localhost:3001`

The dev script uses bash signal forwarding so `Ctrl+C` properly terminates both
servers.

### SSR Architecture

The project supports Server-Side Rendering (SSR):

- Client entry: `client/src/entry-client.tsx`
- Server entry: `client/src/entry-server.tsx`
- Build outputs go to `dist/public` (client) and `dist/server` (SSR)

In production, the Bun server serves static files from `dist/public` and handles
SSR rendering using the SSR bundle.

### Routing System

Uses **TanStack Router v1.132** with file-based routing defined in
`client/src/router-enhanced.tsx`:

- Hash-based routing (default)
- Route guards for authentication, rate limiting, dev-only routes
- Lazy-loaded components for code splitting
- Enhanced error boundaries and loading states
- Route performance tracking

### Database Layer

- **ORM:** Drizzle ORM with Better-SQLite3
- **Schema:** Defined in `server/db/schema.ts`
- **Tables:** `projects`, `terminal_commands`, `portfolio_content`
- **Validation:** Drizzle-Zod schemas auto-generated from tables
- **Migrations:** Managed with `drizzle-kit` in the `drizzle/` directory

Database instance is initialized in `server/db/drizzle.ts` and imported as
`orm`.

### API Routes

REST API defined in two route files:

- `server/routes/api.ts` - Core portfolio API (`/api/profile`, `/api/projects`,
  `/api/content/:section`)
- `server/routes/terminal.ts` - Terminal command execution (`/api/commands`,
  `/api/commands/execute`)

All routes use:

- Structured error handling via `server/lib/error-handling.ts`
- Zod validation via `server/lib/validation.ts`
- TypeScript types from `server/db/schema.ts`

### Terminal Command System

The portfolio features an interactive terminal interface:

- Commands stored in `terminal_commands` table with templates
- Execution happens in `server/routes/terminal.ts`
- Template processor in `server/utils/template-processor.ts` handles variable
  substitution
- ANSI color utilities in `server/utils/terminal.ts`

When modifying terminal commands:

1. Update database schema if adding fields
2. Update validation schemas in `server/db/schema.ts`
3. Implement command logic in `server/routes/terminal.ts`
4. Add client-side UI in `client/src/components/terminal/`

### Frontend Component Organization

```
client/src/components/
├── terminal/          # Terminal interface components
├── desktop/           # Desktop chrome and window management
├── ui/                # Reusable UI primitives (buttons, cards, etc.)
├── accessibility/     # Accessibility utilities
├── icons/             # Icon wrappers and helpers
└── providers/         # React context providers
```

### State Management

- **Server State:** TanStack Query (React Query) for API data fetching/caching
- **Router State:** TanStack Router for navigation state
- **Local State:** React hooks (useState, useReducer) for component state
- No global state management library - keep state local or in URL params

### Styling System

- **Framework:** Tailwind CSS v4 with PostCSS
- **Theme:** CSS custom properties defined in `client/src/index.css`
- **Colors:** Terminal-themed palette (cyan, green, pink, grayscale)
- **Typography:** SF Mono Powerline for terminal, system fonts for UI
- **Animations:** Motion (Framer Motion fork) for CRT effects, scanlines, cursor

Key color values:

- Cyan: `#33b1ff` (bright), `#82cfff` (soft)
- Green: `#42be65` (terminal success)
- Pink/Magenta: `#be95ff` (bright), `#ff7eb6` (soft)

### Iconography

- **Lucide React:** Primary icon library for UI controls
- **Simple Icons:** Brand marks via `react-simple-icons` package
- **Custom SVG:** Legacy icons in `client/src/components/icons/`

Import icons through helper components to maintain consistency.

## OpenSpec Workflow

This project uses **OpenSpec** for spec-driven development. Before making
architectural changes, breaking changes, or adding new capabilities:

1. Read `openspec/AGENTS.md` for full OpenSpec instructions
2. Check for existing specs: `openspec list --specs`
3. Check for active changes: `openspec list`
4. Create a proposal in `openspec/changes/[change-id]/`
5. Validate proposal: `openspec validate [change-id] --strict`
6. Wait for approval before implementing
7. After deployment, archive: `openspec archive [change-id]`

### When to Create a Proposal

- New features or capabilities
- Breaking changes (API, schema, routes)
- Architecture changes
- Performance optimizations that change behavior
- Security pattern updates

### When to Skip Proposal

- Bug fixes restoring intended behavior
- Typos, formatting, comments
- Non-breaking dependency updates
- Configuration tweaks
- Tests for existing behavior

## TypeScript Configuration

The project uses **strict TypeScript** with additional safety:

- `@total-typescript/ts-reset` for safer built-ins
- All strict flags enabled
- `noUncheckedIndexedAccess: true` - array access returns `T | undefined`
- `exactOptionalPropertyTypes: true` - no undefined assignment to optional props
- Prefer `interface` over `type` (enforced by ESLint)
- Use `type` imports: `import { type Foo } from 'bar'`

## ESLint Configuration

Key linting rules enforced:

- **React:** JSX runtime (no React import needed), hooks rules, no unstable
  nested components
- **TypeScript:** Strict type checking, prefer nullish coalescing, optional
  chaining
- **Import ordering:** Grouped by builtin, external, internal, parent, sibling
  with alphabetization
- **Accessibility:** JSX a11y rules enforced
- **Code quality:** No console in client (warn), no debugger, prefer const,
  eqeqeq

Console.log is allowed in:

- `server/**/*.ts` (all server code)
- `client/src/entry-server.tsx` (SSR entry)

## Testing Strategy

- **Framework:** Vitest 3 with jsdom environment
- **Utilities:** Testing Library (React, jest-dom)
- **Location:** Tests in `__tests__/` directories or `*.test.ts` files
- **Coverage:** High thresholds set for components (85%) and server lib (90%)

Custom test utilities in `client/src/test-utils/` provide:

- Enhanced render functions with providers
- Common test setup and teardown

When writing tests:

- Use Testing Library queries (`getByRole`, `findByText`, etc.)
- Test user behavior, not implementation
- Use `jest-dom` matchers for assertions
- Mock API calls with Vitest's mock utilities

## Important Notes

### Runtime: Bun

This project uses **Bun** as the JavaScript runtime (not Node.js). Commands
should use `bun` or `bunx`, not `npm`/`npx`:

```fish
bun install              # Install dependencies
bun add <package>        # Add dependency
bun add -d <package>     # Add dev dependency
bunx <command>           # Run package binary
```

### Environment Variables

Optional env vars (set in `.env` if needed):

- `PORT` - API server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### File Watching

If hot reload isn't working:

- Check that Vite dev server is running on port 5173
- Verify file is inside `client/` directory
- Check for syntax errors in the file

### Database Migrations

When changing the database schema:

1. Modify `server/db/schema.ts`
2. Run `bunx drizzle-kit generate` to create migration
3. Run `bunx drizzle-kit migrate` to apply migration
4. Commit both schema file and generated migration SQL

### Deployment

Production builds require:

1. `bun run build:production` - Creates client + SSR bundles in `dist/`
2. `bun run start:production` - Starts Bun server serving built assets

For Cloudflare Workers deployment:

- `wrangler.toml` configured for Containers with Durable Objects
- Deploy with `bun run cf:deploy`

## Legacy Code Cleanup

When modifying or adding features that overlap with existing code:

- **Always** verify legacy code before implementation
- Look for conflicts, outdated patterns, or technical debt
- Remove or refactor legacy code when safe (don't break working features)
- Keep implementations clean and aligned with current architecture
- Update tests to reflect changes

The project prioritizes maintainability - prefer simplicity and boring solutions
over clever abstractions unless there's proven need.
