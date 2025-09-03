# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Essential Commands

### Development

- `bun run dev` - Start full-stack development (client + server)
- `bun run dev:client` - Client-only development server (Vite)
- `bun run dev:server` - Server-only development (Bun with hot reload)
- `bun run dev:enhanced` - Enhanced development workflow with additional tooling
- `bun run dev:full` - Full development with HMR coordination

### Build & Production

- `bun run build` - Build both client and server for production
- `bun run build:production` - Production build with NODE_ENV=production
- `bun run build:full` - Full build with all checks (types, lint, format, tests)
- `bun run build:clean` - Clean build (removes old files first)
- `bun run preview` - Build and serve full production preview
- `bun run start:production` - Start production server

### Code Quality

- `bun run check:all` - Run all checks (types, lint, format, tests)
- `bun run check:types` - TypeScript type checking only
- `bun run check:lint` - Check for linting errors
- `bun run check:prod` - Production-specific checks (stricter linting)
- `bun run fix:all` - Auto-fix linting and formatting issues
- `bun run fix:lint` - Fix linting errors only
- `bun run fix:format` - Fix formatting only
- `bun run test:run` - Run tests once
- `bun run test:coverage` - Run tests with coverage
- `bun run test:ui` - Run tests with UI interface

### Database

- `bun run db:migrate` - Apply database migrations
- `bun run db:studio` - Open Drizzle Studio (database browser)
- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:push` - Push schema changes directly to database
- `bun run db:cli` - Open SQLite CLI for direct database access

### Environment & Configuration

- `bun run env:validate` - Validate environment variables
- `bun run env:example` - Copy .env.example to .env
- `bun run config:validate` - Validate build configuration
- `bun run config:integration` - Check configuration integration

## Architecture Overview

### Tech Stack

- **Runtime**: Bun (JavaScript/TypeScript runtime)
- **Frontend**: React 19 + Vite + TanStack Router
- **Backend**: Elysia (Bun web framework)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Testing Library

### Project Structure

```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/          # Bun/Elysia backend
│   ├── routes/      # API route handlers
│   ├── db/          # Database schema and utilities
│   ├── lib/         # Shared server utilities
│   └── scripts/     # Build and deployment scripts
└── shared/          # Shared configuration and types
```

### Full-Stack Architecture

- **SSR**: Production builds include server-side rendering
- **Development**: Client (Vite:5173) proxies API calls to server (Bun:3001)
- **Production**: Single Elysia server serves both static assets and SSR
- **Database**: SQLite file at `./database/portfolio.db`

### Configuration System

The project uses a centralized configuration system in `shared/config.ts`:

- Validates environment variables on startup
- Provides type-safe configuration access
- Manages build outputs, paths, and tool configurations
- Environment-specific settings (dev/prod/test)

### Key Development Patterns

#### Path Aliases

- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@server/` → `server/`

#### Build System

- **Client**: Vite builds to `dist/public/`
- **Server**: Vite SSR build to `dist/server/`
- **Production**: Elysia serves from `dist/public/` with SSR fallback
- **Development**: Client (Vite:5173) proxies `/api` calls to server (Bun:3001)

#### Database Schema (Drizzle)

- `projects` - Portfolio project data with tech stack, URLs, and status
- `terminalCommands` - Custom terminal commands with templates and metadata
- `portfolioContent` - Dynamic content sections for different pages

#### API Architecture

- REST endpoints under `/api/` prefix
- Terminal simulation endpoints under `/terminal/` prefix
- Zod validation for all inputs/outputs with custom schemas
- Type-safe database queries with Drizzle ORM
- Security middleware with CORS, rate limiting, and headers

#### Terminal System

- Custom command processing with template variables
- Command aliases and argument schemas
- Rich terminal UI with theming support
- Portfolio data integration through terminal commands

### Security & Production

- CORS configuration for cross-origin requests
- Rate limiting on all endpoints
- Security headers in production
- Environment variable validation
- SQLite database with connection pooling

### Testing Strategy

- Unit tests with Vitest
- Component tests with Testing Library
- API endpoint testing
- Terminal functionality testing
- Accessibility testing included

### Development Workflow

1. Environment setup: Copy `.env.example` to `.env`
2. Database setup: `bun run db:migrate`
3. Start development: `bun run dev`
4. Code quality: `bun run check:all` before commits
5. Production preview: `bun run preview`

### Important Notes

- **Before committing**: Always run `bun run check:all` to ensure code quality
- **For production builds**: Use `bun run build:production` for
  NODE_ENV=production
- **Database changes**: Run `bun run db:generate` after schema changes, then
  `bun run db:migrate`
- **Environment validation**: Run `bun run env:validate` if experiencing
  configuration issues
- **Clean builds**: Use `bun run build:clean` if encountering caching issues

### Key Files

- `server/app.ts` - Main server entry point
- `shared/config.ts` - Centralized configuration
- `server/db/schema.ts` - Database schema definitions
- `vite.config.ts` - Build configuration
- `client/src/router.tsx` - Frontend routing setup
