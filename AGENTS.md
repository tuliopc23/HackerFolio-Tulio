# Repository Guidelines

## Project Structure & Module Organization

- `client/`: React app under `client/src/` (routes, components, assets).
  Entrypoints: `entry-client.tsx`, `entry-server.tsx`.
- `server/`: Elysia app (`server/app.ts`), routes in `server/routes/`, DB in
  `server/db/`, utilities in `server/lib/`.
- `shared/`: Cross‑shared TypeScript modules importable via `@shared/*`.
- `database/`: SQLite data (e.g., `portfolio.db`); migrations in `drizzle/`.
- `__tests__/`: Client and server tests under `client/__tests__/` and
  `server/__tests__/`.
- Build output: `dist/`. Config: `tsconfig.json`, `vite.config.ts`,
  `vitest.config.ts`.

## Build, Test, and Development Commands

- `bun run dev`: Run server and client with hot reload.
- `bun run build`: Build dev/SSR; `bun run build:production`: production build.
- `bun run preview`: Build then start the production server.
- `bun run check:lint` | `check:types` | `check:format` | `check:all`: Lint,
  typecheck, format.
- `bun run fix:all`: Prettier + ESLint fixes.
- `bun run test:run`: Run tests (CI); `bun run test:watch`: watch mode.
- DB: `bun run db:generate` → `bun run db:migrate` → optional
  `bun run db:studio`.

## Coding Style & Naming Conventions

- TypeScript strict (ES2022). Aliases: `@/*`, `@shared/*`, `@server/*`.
- Prettier: no semicolons, single quotes, 100‑char width, 2‑space indent,
  trailing commas.
- ESLint: React + TS rules; prefer type‑only imports.
- React: PascalCase components, named exports, self‑closing tags, fragments
  (`<>`).
- Files: kebab‑case (e.g., `user-card.tsx`). Keep changes focused and minimal.

## Testing Guidelines

- Framework: Vitest + Testing Library (jsdom).
- Locations: `__tests__/` or `*.test.{ts,tsx}`. Use `client/src/test-utils/`
  helpers.
- Coverage: ≥80% global (see `vitest.config.ts`).
- Commands: `bun run test:run` or `vitest run --coverage` for coverage.

## Commit & Pull Request Guidelines

- Commits: Conventional Commits (e.g., `feat:`, `fix:`, `chore:`). Use
  imperative mood and clear scope.
- Before PR: run `bun run check:all` and ensure tests pass.
- PRs: include summary, linked issues, steps to test, and UI screenshots if
  applicable.

## Security & Configuration Tips

- Env: copy `.env.example` → `.env` with `bun run env:example`, then validate
  via `bun run env:validate`.
- Database: for schema changes, run `db:generate` then `db:migrate`. Local DB
  lives under `database/`.
