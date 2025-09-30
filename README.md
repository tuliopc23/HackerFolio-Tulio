# HackerFolio

A modern portfolio website with terminal interface.

## Development

- Dev script spawns both servers with a bash trap runner:
  - `bun server/app.ts` on port `3001` (API/SSR)
  - `vite --config vite.config.ts` on port `5173` (client)
  - Vite proxies `/api` → `http://localhost:3001`
  - Stop with `Ctrl+C` (trap forwards SIGTERM to both)

- Optional env vars:
  - `PORT` (default `3001`)

- Useful URLs:
  - API health: `http://localhost:3001/api/health`
  - Vite dev: `http://localhost:5173/`

```bash
bun run dev               # Start dev (server + Vite)
bun run build:production  # Build for production
bun run start:production  # Start production server
```

## Testing

```bash
bun run test         # Run tests
bun run check:all    # Run all checks (types, lint, format, tests)
```
