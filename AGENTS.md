# AGENTS.md

This file provides guidance for agentic coding assistants working in this
repository.

## Build/Lint/Test Commands

### Build Commands

- `bun run build` - Build both client and server for development
- `bun run build:production` - Production build with NODE_ENV=production
- `bun run build:client` - Build client only
- `bun run build:server` - Build server only (SSR)
- `bun run preview` - Build and serve production preview

### Lint Commands

- `bun run check:lint` - Run ESLint on all files
- `bun run fix:lint` - Auto-fix ESLint issues
- `bun run check:format` - Check Prettier formatting
- `bun run fix:format` - Auto-fix Prettier formatting
- `bun run fix:all` - Auto-fix both linting and formatting

### Test Commands

- `bun run test:run` - Run all tests once
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:ui` - Run tests with UI interface

#### Running Single Tests

- `vitest run <file-path>` - Run specific test file
- `vitest run --reporter=verbose <file-path>` - Run with detailed output
- `bun run test:run -- <file-path>` - Alternative way to run single test

### Type Checking

- `bun run check:types` - Run TypeScript type checking
- `bun run check:all` - Run all checks (types, lint, format, tests)

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled** - All TypeScript strict checks are active
- **Target ES2022** - Modern JavaScript features supported
- **Module resolution**: bundler mode with ES modules
- **JSX**: preserve (handled by Vite/React plugin)
- **Path aliases**:
  - `@/` → `client/src/`
  - `@shared/` → `shared/`
  - `@server/` → `server/`

### Import Style

- **Type imports preferred**: Use `import type { Foo } from 'bar'` for types
- **Import ordering**: Grouped by builtin → external → internal → parent →
  sibling → index
- **Newlines between groups**: Always add blank lines between import groups
- **Alphabetical sorting**: Within each group, sort alphabetically
- **No duplicate imports**: ESLint will catch these
- **First import rule**: All imports must come before any other code

### Formatting (Prettier)

- **No semicolons**: `semi: false`
- **Single quotes**: `singleQuote: true`
- **Print width**: 100 characters
- **Tab width**: 2 spaces, no tabs
- **Trailing commas**: ES5 style (after objects/arrays)
- **Bracket spacing**: Always (spaces around brackets)
- **Arrow parens**: Avoid when possible
- **JSX single quotes**: Enabled

### ESLint Rules

#### React Rules

- **No prop-types**: TypeScript handles prop validation
- **JSX runtime**: New JSX transform (no React import needed)
- **JSX curly braces**: Never require unnecessary braces
- **Self-closing components**: Required
- **Boolean values**: Never (use `checked` not `checked={true}`)
- **Fragments**: Use `<>` syntax
- **Array index keys**: Warn (avoid when possible)
- **Unstable nested components**: Error

#### Accessibility

- **Anchor tags**: Must have valid href or button role
- **Alt text**: Required for images
- **ARIA props**: All ARIA attributes must be valid
- **Role attributes**: Must have required ARIA props

#### TypeScript Rules

- **Unused variables**: Error (prefix with `_` to ignore)
- **Consistent type imports**: Prefer `import type`
- **Consistent type definitions**: Use `interface` over `type`
- **Array type**: Use `T[]` not `Array<T>`
- **Nullish coalescing**: Prefer `??` over `||`
- **Optional chaining**: Prefer `?.` over manual checks
- **No explicit any**: Error
- **No non-null assertion**: Warn (use carefully)
- **Ban ts-comment**: Allow with description, forbid others

#### General Code Quality

- **No console**: Warn (except in server code)
- **No debugger**: Error
- **No alerts**: Error
- **Prefer const**: Always use const when possible
- **Arrow functions**: Prefer over function expressions
- **Object shorthand**: Required
- **Destructuring**: Prefer over property access
- **No eval**: Error
- **Require await**: Error for async functions
- **Yoda conditions**: Error

### React Component Patterns

- **Forward refs**: Use `React.forwardRef` with `displayName`
- **Type definitions**: Define props interfaces above component
- **Default exports**: Avoid, use named exports
- **Component naming**: PascalCase
- **File naming**: kebab-case for files, PascalCase for components

### Error Handling

- **Try/catch blocks**: Use for async operations
- **Error boundaries**: Implement for React components
- **Zod validation**: Use for API inputs/outputs
- **Type-safe errors**: Define error types/interfaces

### Testing Patterns

- **Test framework**: Vitest with Testing Library
- **Test files**: `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`
- **Test structure**: `describe` → `test` with `beforeEach`/`afterEach`
- **Mocking**: Use `vi` from Vitest
- **Async tests**: Use `async`/`await` with `userEvent`
- **Accessibility testing**: Include in component tests

### Database Patterns

- **ORM**: Drizzle with SQLite
- **Schema**: Define in `server/db/schema.ts`
- **Migrations**: Use `bun run db:generate`
- **Type safety**: Generated types from schema
- **Zod integration**: Use `drizzle-zod` for validation

### Security

- **Input validation**: Use Zod schemas
- **Rate limiting**: Applied to all endpoints
- **CORS**: Configured per environment
- **Security headers**: Applied automatically
- **No secrets in code**: Use environment variables

### Performance

- **Bundle analysis**: Check with `bun run build:production`
- **Code splitting**: Automatic with Vite
- **Image optimization**: Use appropriate formats
- **Lazy loading**: Implement for routes/components

## Development Workflow

1. **Setup**: Copy `.env.example` to `.env`, run `bun run db:migrate`
2. **Development**: `bun run dev` (client + server)
3. **Code quality**: `bun run check:all` before commits
4. **Testing**: `bun run test:run` to verify changes
5. **Production**: `bun run preview` to test production build

## Architecture Notes

- **SSR**: Production builds include server-side rendering
- **API routes**: Under `/api/` prefix with Zod validation
- **Terminal routes**: Under `/terminal/` for terminal simulation
- **Database**: SQLite with Drizzle ORM
- **Configuration**: Centralized in `shared/config.ts`</content>
  </xai:function_call/> </xai:function_call name="run">
  <parameter name="command">bun run check:all
