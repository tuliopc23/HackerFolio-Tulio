# Project Context

## Purpose

HackerFolio is a modern portfolio website with an interactive terminal interface
that showcases projects and skills in a developer-friendly way. The goal is to
create an engaging, accessible portfolio that demonstrates technical
capabilities through its implementation.

## Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router, TanStack Query
- **Backend**: Elysia.js (Bun-based web framework)
- **Database**: SQLite with Drizzle ORM
- **Styling**: TailwindCSS with custom components
- **Animation**: Motion (Framer Motion successor)
- **Runtime**: Bun (development and production)
- **Build**: Vite with SSR support
- **Testing**: Vitest with Testing Library

## Project Conventions

### Code Style

- TypeScript strict mode with total-typescript/ts-reset
- Prettier for formatting with ESLint for linting
- Component naming: PascalCase for React components
- File naming: kebab-case for most files, PascalCase for components
- Import organization: external deps → internal modules → relative imports

### Architecture Patterns

- Full-stack TypeScript with shared types via Zod schemas
- Component-based architecture with composition over inheritance
- Server-side rendering (SSR) with client hydration
- Terminal-themed UI with desktop metaphors
- Accessibility-first design with focus management and skip links
- Type-safe database queries with Drizzle ORM

### Testing Strategy

- Unit tests with Vitest and jsdom
- Component testing with Testing Library
- Accessibility testing integrated into component tests
- Type checking as part of CI/CD pipeline
- Test coverage for critical user flows

### Git Workflow

- Feature branches for new development
- Conventional commits preferred
- All checks must pass before merge (types, lint, format, tests)
- Production deployments from main branch

## Domain Context

This is a developer portfolio website with terminal interface theming. Key
concepts:

- **Terminal Commands**: Interactive CLI-style navigation and content display
- **Desktop Metaphor**: Floating windows, dock-style navigation
- **Accessibility**: Screen reader support, keyboard navigation, focus
  management
- **Performance**: SSR for fast initial loads, client-side routing for smooth
  navigation

## Important Constraints

- Must maintain accessibility standards (WCAG compliance)
- Terminal theme should remain consistent across all features
- Performance budget: fast initial load times
- Mobile responsiveness required despite terminal theming
- TypeScript strict mode must be maintained

## External Dependencies

- No external APIs currently used
- Self-hosted SQLite database
- Font loading: SF Mono Powerline for terminal aesthetic
- Build/deployment: Dockerized for container environments
