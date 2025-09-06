# CRUSH.md - Essential Guide for Coding Agents

## Commands

- **Development**: `bun run dev` (client + server with hot reload)
- **Build**: `bun run build:production` (production build)
- **Start**: `bun run start:production` (production server)
- **Test**: `bun run test` | `bun run check:all` (complete validation)
- **Lint**: `bun run check:lint` | `bun run fix:lint` | `bun run fix:all`
- **Types**: `bun run check:types`

## Code Style

- **TypeScript**: Strict mode, ES2022, path aliases (`@/` → `client/src/`,
  `@server/`)
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
  Router + TanStack Query
- **Database**: SQLite at `database/portfolio.db` (bundled with app, no
  migrations needed)
- **Patterns**: SSR production builds, API routes (`/api/`), terminal routes
  (`/terminal/`)
- **Data Layer**: TanStack Query for caching, background sync, optimistic
  updates
- **Development**: `bun run dev` (client + server), `bun run check:all` before
  commits

## Simplified Structure

- **No rate limiting** - Portfolio doesn't need API throttling
- **Simple CORS** - Allows all origins for public portfolio
- **Minimal security** - Basic headers only in production
- **Direct database** - No complex migrations or seeding
- **Clean imports** - Removed duplicate configuration files
