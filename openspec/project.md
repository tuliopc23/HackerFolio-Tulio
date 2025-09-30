# Project Context

## Purpose

HackerFolio is a modern terminal-themed portfolio website that provides an
interactive command-line interface experience for showcasing projects, skills,
and professional information.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Router:** TanStack Router v1.132 with enhanced route preloading
- **Styling:** Tailwind CSS v4, CSS custom properties, PostCSS
- **Backend:** Elysia.js (Bun-based server) on port 3001
- **Database:** Better-SQLite3 with Drizzle ORM
- **State Management:** TanStack Query
- **Testing:** Vitest, Testing Library, jsdom
- **Runtime:** Bun v1.2+
- **Animation:** Motion (Framer Motion fork)

## Project Conventions

### Code Style

- TypeScript strict mode enabled
- ESLint with TypeScript, React, and Prettier plugins
- Prettier for consistent formatting
- Font: SF Mono for terminal/monospace, system fonts for sans-serif
- Terminal aesthetic with phosphor glow effects and scanline animations

### Color System (Current)

- **Cyan:** Primary interactive color (`#33b1ff` bright, `#82cfff` soft)
- **Green:** Terminal success/prompt color (`#42be65`)
- **Pink/Magenta:** Accent color (`#be95ff` bright, `#ff7eb6` soft)
- **Grayscale:** `#f2f4f8` (light text), `#393939` (borders/dividers), `#0a0a0a`
  (dark bg)
- ANSI color mappings for terminal output

### Architecture Patterns

- **Monorepo structure:** `client/`, `server/`, `database/`
- **SSR-ready:** Entry points for both client and server rendering
- **Component organization:**
  - `client/src/components/terminal/` - Terminal UI components
  - `client/src/components/desktop/` - Desktop background elements
  - `client/src/components/ui/` - Reusable UI primitives
  - `client/src/components/accessibility/` - A11y utilities
- **Route structure:** File-based routing with TanStack Router
- **API routes:** REST endpoints under `/api` prefix, proxied via Vite in dev
- **Database schema:** Drizzle ORM with migrations in `drizzle/` directory

### Testing Strategy

- Unit tests with Vitest for components and utilities
- React Testing Library for component integration tests
- Accessibility tests using jest-dom matchers
- Test files colocated in `__tests__/` directories
- Run all checks: `bun run check:all` (types, lint, format, tests)

### Git Workflow

- Main development on `main` branch
- Feature branches for significant changes
- Commit messages should be clear and descriptive
- Pre-deployment validation with full test suite

## Domain Context

This is a terminal-themed portfolio application that simulates a Unix-like
command-line interface. Users can interact with the portfolio through terminal
commands, view system information in styled panes, and navigate projects through
a terminal-inspired UI. The aesthetic emphasizes retro computing (CRT effects,
phosphor glow) while maintaining modern web performance standards.

## Important Constraints

- Must maintain terminal aesthetic and retro computing theme
- Performance: optimize for 60fps animations and smooth scrolling
- Accessibility: keyboard navigation must work throughout
- Color system must maintain sufficient contrast ratios (WCAG AA minimum)
- Typography must be readable at default browser font sizes
- No layout shifts or text overflow breaking card boundaries
- Must work on both desktop and mobile viewports

## External Dependencies

- **CSS Fonts:** SF Mono Powerline (local font files in
  `client/src/assets/fonts/`)
- **Icons:** Custom SVG icons, Boxicons (in specimen files)
- **Build Tools:** Vite for bundling, esbuild for optimization
- **Tailwind Plugins:** tailwindcss-animate, @tailwindcss/typography
