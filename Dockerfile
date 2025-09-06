# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 oven/bun:1.2 AS base
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    python3 \
    make \
    g++ \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# -------------------------------------------------------------------
# Stage: deps – install production dependencies
# -------------------------------------------------------------------
FROM base AS deps

COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile && bun pm cache clean

# -------------------------------------------------------------------
# Stage: build – build the application
# -------------------------------------------------------------------
FROM base AS build

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN NODE_ENV=production bun run build:production

# Verify build artifacts
RUN test -f dist/public/index.html || (echo "❌ Build failed: index.html not found" && exit 1)
RUN test -d dist/public/assets || (echo "❌ Build failed: assets directory not found" && exit 1)
RUN test -f dist/server/entry-server.js || (echo "❌ Build failed: SSR bundle not found" && exit 1)
RUN test -f database/portfolio.db || (echo "❌ Build failed: database not found" && exit 1)

# -------------------------------------------------------------------
# Stage: runtime – minimal production image
# -------------------------------------------------------------------
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000
ENV BUN_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copy built application and database
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/database ./database

# Create directories and set permissions
RUN mkdir -p logs tmp && \
    chown -R bun:bun /app && \
    chmod -R 755 /app

# Verify runtime artifacts
RUN test -f dist/public/index.html || (echo "❌ Runtime error: index.html missing" && exit 1)
RUN test -f database/portfolio.db || (echo "❌ Runtime error: database missing" && exit 1)

USER bun

EXPOSE 8000

CMD ["bun", "run", "start:production"]