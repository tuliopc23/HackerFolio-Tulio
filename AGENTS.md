# Repository Guidelines

This guide explains how this project is organized, how to build/test it, and how to contribute changes safely and consistently.

## Project Structure & Module Organization
- `client/` — Vite + React (SSR). Entries: `src/entry-client.tsx`, `src/entry-server.tsx`; routes in `src/pages/`; UI in `src/components/`.
- `server/` — Bun + Elysia API/SSR. Entry: `app.ts`; `routes/`, `db/` (Drizzle ORM), `middleware/`, `utils/`.
- `database/` — SQLite file (`portfolio.db`).
- `drizzle/` — Migrations/artifacts (`drizzle.config.ts`).
- `dist/` — Build output (`dist/public`, `dist/server`). `coverage/` — test reports.

## Build, Test, and Development Commands
- Install: `bun install` (Node 18+/Bun 1+; `.nvmrc` targets Node 22).
- Develop: `bun run dev` (Vite + server; `/api` proxied to `http://localhost:3001`).
- Build: `bun run build` (client + SSR bundles). Start prod: `bun run start:production`.
- Quality: `bun run check:all` (types, lint, format, tests). Quick fixes: `bun run fix:all`.
- Tests: `bun run test` (Vitest). Watch locally: `bunx vitest --watch`.
- Docker: `docker-compose up --build` (serves on `http://localhost:8000`).

## Coding Style & Naming Conventions
- TypeScript strict; React 19. Path aliases: `@/*` and `@server/*` (e.g., `import { apiRoutes } from '@server/routes/api'`).
- Prettier: 2 spaces, single quotes, no semicolons, width 100. Run `bun run fix:format`.
- ESLint enforces import order, React hooks/a11y rules. Prefer named exports; avoid anonymous default exports.
- Filenames: kebab-case for files; React components in PascalCase.

## Testing Guidelines
- Framework: Vitest (jsdom) + Testing Library. Include tests under `__tests__/` or `**/*.{test,spec}.{ts,tsx}`.
- Coverage: global ≥ 80% (stricter in `client/src/components/**` and `server/lib/**`). Reports in `coverage/`.
- Run locally: `bun run test`. CI uses JUnit/JSON outputs.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- PRs must include: clear description, linked issues, UI screenshots (when applicable), and test/coverage notes.
- Before opening: rebase on `main` and run `bun run check:all`.

## Security & Configuration Tips
- Copy `.env.example` to `.env`. Key vars: `PORT`, `DATABASE_URL` (e.g., `./database/portfolio.db`), CORS origins.
- Don’t commit secrets or local DB files. Use Docker (`PORT=8000`) for parity.

## Agent-Specific Instructions
- Keep changes scoped; follow existing structure and style. Update or add tests with behavioral changes. Avoid unrelated refactors and file renames without justification.

