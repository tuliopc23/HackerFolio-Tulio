# Repository Guidelines

## Project Structure & Module Organization

- `client/`: React app (routes, components, assets) under `client/src/`.
  Entrypoints: `entry-client.tsx`, `entry-server.tsx`.
- `server/`: Elysia server (`app.ts`), API routes in `server/routes/`, DB code
  in `server/db/`, utilities in `server/lib/`.
- `shared/`: Cross‑shared TypeScript (`@shared/*`).
- `database/`: SQLite data files (e.g., `portfolio.db`). Migrations in
  `drizzle/`.
- `__tests__/`: Unit/integration tests under `client/__tests__/` and
  `server/__tests__/`.
- Build output: `dist/`; config: `tsconfig.json`, `vite.config.ts`,
  `vitest.config.ts`.

## Build, Test, and Development Commands

- Develop: `bun run dev` — runs server and client concurrently with hot reload.
- Build (dev/SSR): `bun run build` | Production: `bun run build:production`.
- Preview: `bun run preview` — builds then starts prod server.
- Lint/Types/Format: `bun run check:lint` | `bun run check:types` |
  `bun run check:format` | All: `bun run check:all`.
- Fix: `bun run fix:all` (Prettier + ESLint).
- Tests: `bun run test:run` (CI) | watch: `bun run test:watch` | coverage
  example: `vitest run --coverage`.
- Database: `bun run db:generate` (migrations) | `bun run db:migrate` |
  `bun run db:studio`.

## Coding Style & Naming Conventions

- TypeScript strict mode (ES2022). Aliases: `@/*`, `@shared/*`, `@server/*`.
- Prettier: no semicolons, single quotes, 100‑char width, 2‑space indent,
  trailing commas.
- ESLint: React + TS rules, import resolution via TS paths; prefer type‑only
  imports.
- React: PascalCase components, named exports, self‑closing tags, fragments
  (`<>`). Files: kebab‑case.

## Testing Guidelines

- Framework: Vitest + Testing Library (jsdom). Place tests as `*.test.{ts,tsx}`
  or in `__tests__/`.
- Run: `bun run test:run` locally and in CI. Coverage target: ≥80% global (see
  `vitest.config.ts`).
- Use `client/src/test-utils/` helpers where applicable; mock external
  boundaries.

## Commit & Pull Request Guidelines

- Commits: Prefer Conventional Commits (e.g., `feat:`, `fix:`, `chore:`). Keep
  messages imperative and scoped.
- PRs: Include summary, linked issues, steps to test, and UI screenshots if
  applicable. Run `bun run check:all` before submitting.

## Security & Configuration Tips

- Environment: copy `.env.example` → `.env` with `bun run env:example`, then
  validate via `bun run env:validate`.
- Database: for schema changes, `db:generate` then `db:migrate`. Local DB at
  `database/`.
