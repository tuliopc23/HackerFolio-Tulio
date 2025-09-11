# Repository Guidelines

## Project Structure & Module Organization

- `client/`: React 19 app (Vite + SSR). Source in `client/src` with
  `components/`, `pages/`, `lib/`, and `entry-*.tsx`.
- `server/`: Elysia/Bun API and SSR glue. Routes in `server/routes`, helpers in
  `server/lib`, DB in `server/db`.
- `drizzle/`: Schema definitions and metadata. Migrations are not required at
  runtime.
- `database/`: Local SQLite data (via `better-sqlite3`).
- `dist/`: Build output for client and SSR.
- `coverage/`: Test and coverage reports.

## Build, Test, and Development Commands

- `bun i` — install dependencies (uses `bun@1.2.21`).
- `bun run dev` — run server (Bun) and client (Vite) together.
- `bun run build` — build client and SSR bundles via Vite.
- `bun run build:production` — production build with `NODE_ENV=production`.
- `bun run start:production` — start server from source in production mode.
- `bun run test` — run Vitest once (jsdom, forks pool).
- `bun run check:all` — typecheck, lint, format check, and tests.

## Coding Style & Naming Conventions

- Language: TypeScript (strict) and React.
- Formatting: Prettier (2 spaces, single quotes, no semicolons). Run
  `bun run fix:format`.
- Linting: ESLint with React, Hooks, A11y, Import rules. Run
  `bun run check:lint` or `bun run fix:lint`.
- Imports: grouped and alphabetized; prefer type-only imports.
- File names: React components `PascalCase.tsx`; utilities `camelCase.ts`; tests
  `*.test.(ts|tsx)` under `__tests__/`.

## Testing Guidelines

- Framework: Vitest + Testing Library (jsdom). Thresholds: 80% global; higher
  for `client/src/components/**` and `server/lib/**` (see `vitest.config.ts`).
- Run all tests: `bun run test`.
- With coverage: `bun run test -- --coverage` (reports in `coverage/`).

## Architecture Overview

- Rendering: Vite + React SSR. `server/app.ts` handles API routes and serves SSR
  HTML from `client/src/entry-server.tsx`; client hydrates via
  `entry-client.tsx`.
- Routing/Data: UI uses TanStack Router/Query. Server routes under
  `server/routes` read/write via Drizzle ORM (`server/db/drizzle.ts`) against
  SQLite.
- Aliases: `@` → `client/src`, `@server` → `server/` (see `vitest.config.ts`).

## Commit & Pull Request Guidelines

- Commits: short, imperative subject; include scope/type when helpful (e.g.,
  `feat:`, `fix:`, `chore:`). Reference issues like `#123`.
- PRs: clear description, link issues, note user-facing changes. Include
  screenshots for UI changes and update/add tests. Ensure `bun run check:all`
  passes.

## Security & Configuration Tips

- Copy `.env.example` to `.env` and fill required keys. Never commit secrets.
- Bundled DB: `database/portfolio.db` is part of the app (shipped in source and
  Docker). Do not remove/exclude it from builds. Default path is
  `./database/portfolio.db` (override with `DATABASE_URL`).
- Migrations: not needed — the SQLite DB ships pre-seeded and is authoritative.
  Do not run Drizzle migrations in normal workflows. If a schema change is ever
  required, coordinate explicitly.
- Node >= 18 and Bun >= 1.0 required.
