# AGENTS.md - Essential Guide for Coding Assistants

## Commands

- **Build**: `bun run build` (dev) | `bun run build:production` |
  `bun run preview`
- **Lint**: `bun run check:lint` | `bun run fix:lint` | `bun run fix:all`
- **Test**: `bun run test:run` | `vitest run <file-path>` (single test) |
  `bun run test:coverage`
- **Types**: `bun run check:types` | `bun run check:all` (complete validation)
- **Database**: `bun run db:generate` | `bun run db:migrate` |
  `bun run db:studio`

## Code Style

- **TypeScript**: Strict mode, ES2022, path aliases (`@/` → `client/src/`,
  `@shared/`, `@server/`)
- **Formatting**: No semicolons, single quotes, 100 char width, 2 spaces,
  trailing commas
- **Imports**: Type imports (`import type`), grouped/sorted, newlines between
  groups
- **React**: No prop-types, new JSX transform, self-closing tags, fragments
  (`<>`), named exports
- **Naming**: PascalCase components, kebab-case files, interfaces over types
- **Error Handling**: Try/catch for async, error boundaries, Zod validation
- **Testing**: Vitest + Testing Library, `*.test.{ts,tsx}`, `describe`/`test`
  structure

## Architecture

- **Stack**: React + TypeScript + Vite + Elysia + Drizzle + SQLite + TanStack
  Start + TanStack Query
- **Patterns**: SSR production builds, API routes (`/api/`), terminal routes
  (`/terminal/`)
- **Database**: Drizzle ORM, migrations (`bun run db:generate`), Zod integration
- **Data Layer**: TanStack Query for caching, background sync, optimistic
  updates
- **Development**: `bun run dev` (client + server), `bun run check:all` before
  commits</content> </xai:function_call/> </xai:function_call name="run">
  <parameter name="command">bun run check:all
