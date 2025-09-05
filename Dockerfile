# syntax=docker/dockerfile:1

# ---- Base image (Debian, Bun preinstalled) ----
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Prod deps stage (compile native modules once) ----
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
# Copy lockfile & manifest only to maximize layer cache
COPY package.json bun.lock* ./
# Install ONLY production deps (includes native builds like better-sqlite3)
RUN bun install --frozen-lockfile --production

# ---- Build stage (full deps for Vite/Rollup, no arch pinning) ----
FROM base AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock* ./
# Install ALL deps needed to build (dev + prod)
RUN bun install --frozen-lockfile
# Bring in the rest of the source
COPY . .
# Build app artifacts; keep NODE_ENV unset here so devDeps are available to Vite
RUN bun run build:production

# ---- Runtime stage (small, no compilers) ----
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=8000
WORKDIR /app

# Copy precompiled prod node_modules and minimal app files
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle ./drizzle

# App data dir (e.g., for SQLite), and correct ownership
RUN mkdir -p database && chown -R bun:bun /app
USER bun

EXPOSE 8000
CMD ["bun", "run", "start:production"]
