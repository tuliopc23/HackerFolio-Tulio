# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `bun run dev` - Start full-stack development (client + server)
- `bun run dev:client` - Client-only development server (Vite)
- `bun run dev:server` - Server-only development (Bun with hot reload)

### Build & Production
- `bun run build` - Build both client and server for production
- `bun run build:production` - Production build with NODE_ENV=production
- `bun run preview` - Build and serve full production preview
- `bun run start:production` - Start production server

### Code Quality
- `bun run check:all` - Run all checks (types, lint, format, tests)
- `bun run check:types` - TypeScript type checking only
- `bun run fix:all` - Auto-fix linting and formatting issues
- `bun run test:run` - Run tests once
- `bun run test:coverage` - Run tests with coverage

### Database
- `bun run db:migrate` - Apply database migrations
- `bun run db:studio` - Open Drizzle Studio (database browser)
- `bun run db:generate` - Generate migrations from schema changes

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

#### Database Schema (Drizzle)
- `projects` - Portfolio project data
- `terminalCommands` - Custom terminal commands
- `portfolioContent` - Dynamic content sections

#### API Architecture
- REST endpoints under `/api/` prefix
- Terminal simulation endpoints under `/terminal/`
- Zod validation for all inputs/outputs
- Type-safe database queries with Drizzle

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

### Key Files
- `server/app.ts` - Main server entry point
- `shared/config.ts` - Centralized configuration
- `server/db/schema.ts` - Database schema definitions
- `vite.config.ts` - Build configuration
- `client/src/router.tsx` - Frontend routing setup