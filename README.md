# HackerFolio

A modern portfolio website with a terminal-inspired interface, built with Go Fiber backend and React frontend.

## Architecture

- **Backend**: Go Fiber API server
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Package Manager**: Bun

## Development

### Prerequisites

- Go 1.21+
- Bun
- Node.js (for some tooling)

### Quick Start

```bash
# Install dependencies
bun install

# Start development servers (API + Frontend)
npm run dev
# or
./dev.sh
```

This will start:
- Go Fiber API on `http://localhost:8080`
- Vite dev server on `http://localhost:5173`

### Individual Commands

```bash
# Frontend only
npm run dev:frontend

# API only  
npm run dev:api

# Build everything
npm run build

# Build frontend only
npm run build:frontend

# Build API only
npm run build:api

# Type checking
npm run check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## Project Structure

```
├── api/                    # Go Fiber backend
│   ├── main.go
│   ├── handlers/
│   └── ...
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   └── ...
├── dist/                   # Build output
│   ├── public/            # Frontend assets
│   └── server             # Go binary
├── attached_assets/        # Static assets
└── dev.sh                 # Development script
```

## Features

- Terminal-inspired UI with multiple themes
- Responsive design
- Type-safe development with TypeScript
- Modern tooling with ESLint, Prettier
- Fast development with Vite HMR
- Production-ready builds

## Deployment

```bash
# Build for production
npm run build

# Run production server
npm run start
```

The built application will be in the `dist/` directory with the Go server binary and frontend assets.
