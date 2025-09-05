# syntax=docker/dockerfile:1

# Base image: stick to linux/amd64 so Bun pulls the correct native optional deps
FROM --platform=linux/amd64 oven/bun:1.2 AS base
WORKDIR /app

# -------------------------------------------------------------------
# Stage: deps – install only production dependencies
# -------------------------------------------------------------------
FROM base AS deps
# Build tools for native modules like better-sqlite3
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
# Copy only package manifest so Bun resolves the proper platform-specific
# optional dependencies (e.g., @rollup/rollup-linux-x64-gnu)
COPY package.json ./
RUN bun install --production

# -------------------------------------------------------------------
# Stage: build – install dev deps and build the app
# -------------------------------------------------------------------
FROM base AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN bun install
# Copy application code and run the production build (runs vite, SSR, etc.)
COPY . .
RUN bun run build:production

# -------------------------------------------------------------------
# Stage: runtime – minimal image to run the server
# -------------------------------------------------------------------
FROM base AS runtime
WORKDIR /app

# Set production environment variables. These defaults satisfy the
# environment validation; override them via Koyeb/Kubernetes/App config as needed.
ENV NODE_ENV=production
ENV PORT=8000
ENV APP_URL=http://localhost:8000
ENV API_URL=http://localhost:8000
ENV CORS_ORIGINS=http://localhost:8000
# Replace this with a secure 32+ character secret in real deployments
ENV SESSION_SECRET=change_this_to_a_secure_session_secret_32chars

# Copy production dependencies and built artifacts
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle ./drizzle

# Copy an example env file so Bun loads variables from it if present.
# If you provide your own .env at deploy time, it will override these defaults.
COPY .env.example .env

# Create the database directory and fix ownership
RUN mkdir -p database && chown -R bun:bun /app
USER bun

EXPOSE 8000
# Start the server (will run env:validate then server/app.ts)
CMD ["bun", "run", "start:production"]