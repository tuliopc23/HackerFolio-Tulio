# HackerFolio Commands Reference

## 🚀 Development Commands

### Start Development Server
```bash
# Start both client and server in development mode
bun run dev

# Start with enhanced development workflow
bun run dev:enhanced

# Start with full HMR coordination
bun run dev:full

# Start only the client (Vite dev server)
bun run dev:client

# Start only the server
bun run dev:server
```

## 🏗️ Build Commands

### Basic Build
```bash
# Build both client and server (recommended)
bun run build

# Build only the client (frontend)
bun run build:client

# Build only the server (SSR)
bun run build:server
```

### Advanced Build Options
```bash
# Full build with all checks (types, lint, format, tests)
bun run build:full

# Clean build (removes old files first)
bun run build:clean

# Production build (with production environment)
bun run build:production
```

## 🌐 Production & Preview Commands

### Full-Stack Preview (Client + Server + SSR)
```bash
# Build and preview complete application with SSR
bun run preview

# Serve the already built full-stack application
bun run serve

# Start production server (full-stack)
bun run start:production
```

### Client-Only Preview (Frontend Only)
```bash
# Preview only the client build (no server/SSR)
bun run preview:client

# Serve only the client build on port 4173
bun run serve:client
```

### Development Server
```bash
# Start development server (full-stack)
bun run start
```

## 🧪 Testing Commands

```bash
# Run tests once
bun run test:run

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run tests with UI
bun run test:ui

# Just run tests (alias for test:watch)
bun run test
```

## 🔍 Code Quality Commands

### Type Checking
```bash
# Check TypeScript types
bun run check:types
```

### Linting
```bash
# Check for linting errors
bun run check:lint

# Fix linting errors automatically
bun run fix:lint
```

### Formatting
```bash
# Check code formatting
bun run check:format

# Fix code formatting
bun run fix:format

# Fix both linting and formatting
bun run fix:all
```

### All Checks
```bash
# Run all checks (types, lint, format, tests)
bun run check:all
```

## 🗄️ Database Commands

### Schema Management
```bash
# Generate database migrations from schema changes
bun run db:generate

# Run database migrations
bun run db:migrate

# Push schema changes directly to database
bun run db:push

# Drop database tables (careful!)
bun run db:drop
```

### Database Tools
```bash
# Open Drizzle Studio (web-based database browser)
bun run db:studio

# Open SQLite CLI
bun run db:cli

# Introspect existing database
bun run db:introspect
```

### Database Connection Info
- **Type**: SQLite
- **File Path**: `/Users/tuliopinheirocunha/HackerFolio-Tulio/database/portfolio.db`
- **Relative Path**: `./database/portfolio.db`

## 🌍 Environment Commands

```bash
# Validate environment variables
bun run env:validate

# Copy .env.example to .env
bun run env:example

# Show environment help
bun run env:help
```

## 🔧 Configuration Commands

```bash
# Validate build configuration
bun run config:validate

# Check configuration integration
bun run config:integration

# Validate path mappings
bun run config:paths

# Test configuration matrix
bun run config:test
```

## 🚀 Deployment Commands

```bash
# Generate deployment configurations
bun run deploy:generate

# Setup deployment files
bun run deploy:setup

# Production security hardening
bun run prod:security
```

## 🧹 Cleanup Commands

```bash
# Clean build artifacts
bun run clean

# Health check (for deployment)
bun run health-check
```

## 📋 Most Common Workflows

### 1. Start Development
```bash
bun run dev
```

### 2. Build for Production
```bash
bun run build
```

### 3. Preview Production Build
```bash
bun run preview
```

### 4. Run All Checks Before Commit
```bash
bun run check:all
```

### 5. Fix Code Issues
```bash
bun run fix:all
```

### 6. Clean Build from Scratch
```bash
bun run build:clean
```

## 🔧 Troubleshooting Commands

### If Build Fails
```bash
# Clean everything and rebuild
bun run clean
bun run build:clean

# Check environment
bun run env:validate

# Validate configuration
bun run config:validate
```

### If Development Server Issues
```bash
# Check configuration integration
bun run config:integration

# Validate path mappings
bun run config:paths
```

### If Production Issues
```bash
# Run security checks
bun run prod:security

# Generate deployment configs
bun run deploy:setup
```

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development |
| `bun run build` | Build for production |
| `bun run preview` | Build and preview (full-stack) |
| `bun run preview:client` | Preview client-only |
| `bun run serve` | Serve full-stack app |
| `bun run serve:client` | Serve client-only |
| `bun run test:run` | Run tests |
| `bun run check:all` | Run all checks |
| `bun run fix:all` | Fix code issues |
| `bun run clean` | Clean build files |

## 🚨 Important Notes

1. **Environment Variables**: Make sure your `.env` file is properly configured
2. **Node Version**: Use Node.js 18+ or Bun for best compatibility
3. **Build Order**: Client build must complete before server build for SSR
4. **Production**: Always run `bun run check:all` before deploying
5. **Clean Builds**: Use `bun run build:clean` if you encounter caching issues
