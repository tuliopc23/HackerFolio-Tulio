# Repository Guidelines

## Project Structure & Module Organization

- `client/`: React 19 app (Vite + SSR). Source in `client/src` with
  `components/`, `pages/`, `lib/`, and `entry-*.tsx`.
- `server/`: Elysia/Bun API and SSR glue. Routes in `server/routes`, helpers in
  `server/lib`, DB in `server/db`.
- `drizzle/`: Schema definitions and metadata (no runtime migrations).
- `database/`: Local SQLite data (`better-sqlite3`).
- `dist/`: Build output; `coverage/`: test/coverage reports.
- Tests live under `__tests__/` and end with `*.test.(ts|tsx)`.

## Build, Test, and Development Commands

- `bun i` — install dependencies (uses `bun@1.2.21`).
- `bun run dev` — run server (Bun) and client (Vite) together.
- `bun run build` — build client and SSR bundles via Vite.
- `bun run build:production` — production build (`NODE_ENV=production`).
- `bun run start:production` — start server from source in production mode.
- `bun run test` — run Vitest once (jsdom, forks pool).
- `bun run check:all` — typecheck, lint, format check, and tests.

## Coding Style & Naming Conventions

- Language: TypeScript (strict) and React.
- Prettier: 2 spaces, single quotes, no semicolons. Run `bun run fix:format`.
- ESLint: React, Hooks, A11y, Import rules. Run `bun run fix:lint`.
- Imports: grouped and alphabetized; prefer `import type { ... }`.
- Filenames: components `PascalCase.tsx`; utilities `camelCase.ts`.

## Testing Guidelines

- Framework: Vitest + Testing Library (jsdom).
- Coverage: ≥80% global; higher for `client/src/components/**` and
  `server/lib/**` (see `vitest.config.ts`).
- With coverage: `bun run test -- --coverage` (outputs to `coverage/`).
- Example: `client/src/components/Button/__tests__/Button.test.tsx`.

## Architecture Overview

- SSR: Vite + React. `server/app.ts` serves SSR HTML from
  `client/src/entry-server.tsx`; client hydrates via `entry-client.tsx`.
- Data: TanStack Router/Query on UI; server routes use Drizzle
  (`server/db/drizzle.ts`) with SQLite at `./database/portfolio.db`.
- Aliases: `@` → `client/src`, `@server` → `server/`.

## Commit & Pull Request Guidelines

- Commits: short, imperative; include type/scope when helpful (e.g., `feat:`,
  `fix:`, `chore:`). Reference issues like `#123`.
- PRs: clear description, link issues, note user-facing changes. Include
  screenshots for UI changes, update/add tests, and ensure `bun run check:all`
  passes.

## Security & Configuration Tips

- Copy `.env.example` to `.env`; never commit secrets.
- The bundled DB `database/portfolio.db` ships with the app; do not
  remove/exclude it. Migrations are not part of normal workflows.
- Requirements: Node >= 18 and Bun >= 1.0.
