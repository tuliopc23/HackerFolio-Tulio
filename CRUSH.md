# HackerFolio Development Guide

## Quick Commands

### Development

```bash
# Start development servers
bun run dev

# Start individual servers
bun run dev:server  # Backend only
bun run dev:client  # Frontend only
```

### Code Quality

```bash
# Check everything
bun run check:all

# Individual checks
bun run check:types    # TypeScript
bun run check:lint     # ESLint
bun run check:format   # Prettier

# Fix issues
bun run fix:format     # Auto-fix Prettier
bunx eslint . --ext .js,.jsx,.ts,.tsx --fix  # Auto-fix ESLint
```

### Database

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate
```

### Build & Deploy

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Dependency Management

```bash
# Audit dependencies
bun audit

# Check for unused dependencies
bunx knip

# Add/remove packages
bun add <package>
bun remove <package>
```

## Code Style Preferences

### TypeScript

- Use strict typing, avoid `any`
- Prefer `interface` over `type` for object shapes
- Use nullish coalescing (`??`) over logical OR (`||`)
- Avoid non-null assertions (`!`) when possible

### React

- Use stable keys for lists (avoid array indices)
- Prefer functional components with hooks
- Use proper accessibility attributes
- Handle loading and error states

### Database

- Use Drizzle ORM with SQLite
- Prefer proper relations over JSON columns
- Validate data with Zod schemas

### API Design

- Use Elysia framework with Bun runtime
- Validate all inputs and outputs
- Return consistent response formats
- Handle errors gracefully

## Architecture Notes

### Data Flow

- API-first approach with database as source of truth
- Static data in `portfolio-data.ts` used as fallback only
- SSR support with TanStack Router

### Component Structure

```
client/src/components/
├── desktop/          # Desktop background
├── terminal/         # Terminal UI components
├── ui/              # Reusable UI components
└── loading-spinner.tsx
```

### Server Structure

```
server/
├── app.ts           # Main server file (needs refactoring)
├── db/              # Database schema and connection
├── lib/             # Validation and utilities
└── types/           # Type definitions
```

## Recent Cleanup (Phases 1-4 Complete)

### Phase 1: Safe Cleanup ✅

- ✅ Removed duplicate `/components/` directory (6 files)
- ✅ Removed unused dependencies: `@getgrit/cli`, `dotted-map`, `tsr`,
  `zod-core`
- ✅ Cleaned unused validation exports in `server/lib/validation.ts`

### Phase 2: Critical Issues ✅

- ✅ Fixed all TypeScript errors (66 → 0)
- ✅ Fixed deprecated Zod `.url()` usage
- ✅ Improved type safety in shared utilities
- ✅ Fixed code formatting issues
- ✅ Added accessibility improvements

### Phase 3: Code Quality ✅

- ✅ Reduced ESLint issues (155 → ~90 remaining)
- ✅ Fixed console statements in critical components
- ✅ Improved error handling patterns
- ✅ Fixed array index key warnings in several components

### Phase 4: Architecture Improvements ✅

- ✅ **Split large server file**: 741 → 86 lines (88% reduction)
- ✅ Created modular structure:
  ```
  server/
  ├── app.ts (86 lines - main server)
  ├── routes/
  │   ├── api.ts (API endpoints)
  │   └── terminal.ts (Terminal commands)
  ├── middleware/
  │   └── logging.ts (Request logging)
  └── utils/
      └── terminal.ts (ANSI helpers)
  ```
- ✅ Improved maintainability and separation of concerns
- ✅ Better error handling and logging structure

## Performance Notes

- Bundle size reduced by removing unused dependencies
- TypeScript compilation is clean (0 errors)
- Development server starts quickly with Bun
- **Server architecture**: Modular design with 88% code reduction in main file
- Better separation of concerns for maintainability

## Remaining Improvements

- ~90 ESLint warnings remain (mostly array index keys and template literals)
- Could add comprehensive error boundaries
- Could implement proper structured logging
- Could add comprehensive testing suite
