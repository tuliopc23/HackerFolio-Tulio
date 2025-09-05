# syntax=docker/dockerfile:1

# Force linux/amd64 since Koyeb logs show "Linux x64 baseline"
FROM --platform=linux/amd64 oven/bun:1.2 AS base
WORKDIR /app

# ---------------- Deps stage (prod deps, compilers only here) ----------------
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Copy ONLY manifest (NO lockfile) so Bun resolves platform-specific optional deps (Rollup, esbuild) for x64
COPY package.json ./
RUN bun install --production

# ---------------- Build stage (dev deps for Vite/Rollup) ----------------
FROM base AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Again: copy ONLY manifest so the build gets x64-correct devDeps (rollup native binding)
COPY package.json ./
RUN bun install

# Bring in the rest of the source and build
COPY . .
# Keep NODE_ENV unset so devDeps are available to Vite
RUN bun run build:production

# ---------------- Runtime stage (slim, no toolchain) ----------------
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=8000
WORKDIR /app

# Copy precompiled production deps and built artifacts
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle ./drizzle

# App data dir (e.g., SQLite) and ownership
RUN mkdir -p database && chown -R bun:bun /app
USER bun

EXPOSE 8000
CMD ["bun", "run", "start:production"]