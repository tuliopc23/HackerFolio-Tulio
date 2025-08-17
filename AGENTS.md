# Repository Guidelines

## Project Structure & Modules
- `api/`: Go Fiber API (`main.go`), serves JSON on port 8080.
- `client/`: React + TypeScript app (Vite + Tailwind). Key folders: `src/components/`, `src/pages/`, `src/hooks/`, `src/lib/`.
- `dist/`: Production output (`dist/server` Go binary + frontend assets).
- `attached_assets/`: Static assets; import via `@assets/*` alias.
- Aliases: `@/*` -> `client/src/*` (see `tsconfig.json`).

## Build, Test, and Development
- Install deps: `bun install`
- Dev (API + Frontend): `npm run dev` or `./dev.sh`
- Frontend only: `npm run dev:frontend`
- API only: `npm run dev:api`
- Build all: `npm run build` (outputs to `dist/`)
- Type check: `npm run check`
- Lint: `npm run lint` | Auto-fix: `npm run lint:fix`
- Format: `npm run format` | Check: `npm run format:check`
- Start production: `npm run start` then open `http://localhost:8080`

## Coding Style & Naming
- Language: TypeScript (frontend), Go (API).
- Formatting: Prettier (2 spaces, 100 char line width, single quotes, trailing commas).
- Linting: ESLint with React + Hooks rules; prefer const, hooks deps warnings.
- File names: kebab-case for files (`status-pane.tsx`), PascalCase for React components, camelCase for variables.
- Paths: use aliases (`@/components/...`) instead of relative chains.

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest + React Testing Library.
- Naming: `*.test.ts` / `*.test.tsx` colocated with source (e.g., `client/src/components/thing.test.tsx`).
- Suggested scripts (once added): `test`, `test:watch`, `coverage`.

## Commit & Pull Requests
- Commit style: mixed; favor Conventional Commits when possible (e.g., `feat: add CRT shader`, `fix(api): handle invalid body`).
- PRs must include: clear description, linked issues (e.g., `Closes #12`), steps to test, and screenshots/GIFs for UI changes.
- Keep diffs focused; run `npm run check`, `lint`, and `format` before pushing.

## Security & Configuration
- Local ports: API `8080`, Vite dev `5173` (CORS allows both).
- No `.env` required; adjust CORS/origins in `api/main.go` if needed.
- Avoid committing large binaries or secrets; output remains in `dist/`.

## Agent-Specific Notes
- Respect path aliases and run linters/formatters before creating PRs.
- Example workflow: `bun install && npm run dev` → edit → `npm run check && npm run lint:fix && npm run format` → commit.

