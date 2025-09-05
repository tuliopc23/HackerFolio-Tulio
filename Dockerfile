# syntax=docker/dockerfile:1

# Multi-platform support with explicit platform for consistency
FROM --platform=linux/amd64 oven/bun:1.2 AS base

# Set working directory
WORKDIR /app

# Install system dependencies needed for native modules
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
# Stage: deps – install only production dependencies
# -------------------------------------------------------------------
FROM base AS deps

# Copy package files for dependency resolution
COPY package.json bun.lockb* ./

# Install production dependencies with platform-specific optimizations
RUN bun install --production --frozen-lockfile \
    && bun pm cache clean

# -------------------------------------------------------------------
# Stage: build – install dev deps and build the app
# -------------------------------------------------------------------
FROM base AS build

# Copy package files first for better caching
COPY package.json bun.lockb* ./

# Install all dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Copy source code (use .dockerignore to exclude unnecessary files)
COPY . .

# Build the application for production
RUN NODE_ENV=production bun run build:production

# Verify build artifacts exist
RUN test -f dist/public/index.html || (echo "❌ Build failed: index.html not found" && exit 1)
RUN test -d dist/public/assets || (echo "❌ Build failed: assets directory not found" && exit 1)
RUN test -f dist/server/entry-server.js || (echo "❌ Build failed: SSR bundle not found" && exit 1)

# List build artifacts for debugging
RUN echo "✅ Build artifacts:" && \
    ls -la dist/ && \
    echo "📁 Public files:" && \
    ls -la dist/public/ && \
    echo "📁 Assets:" && \
    ls -la dist/public/assets/ | head -10

# -------------------------------------------------------------------
# Stage: runtime – minimal image to run the server
# -------------------------------------------------------------------
FROM base AS runtime
WORKDIR /app

# Platform-friendly environment variables
ENV NODE_ENV=production
# PORT will be set by PaaS platform (Koyeb, Railway, etc.)
ENV PORT=8000
# Minimal session secret - should be overridden by platform secrets
ENV SESSION_SECRET=change_this_to_a_secure_session_secret_32chars_minimum_length

# Performance and reliability settings
ENV BUN_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy package.json for runtime
COPY package.json ./

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle ./drizzle

# Copy environment template (will be overridden by platform)
COPY .env.example .env

# Create necessary directories with proper permissions
RUN mkdir -p database logs tmp && \
    chown -R bun:bun /app && \
    chmod -R 755 /app

# Verify runtime artifacts
RUN test -f dist/public/index.html || (echo "❌ Runtime error: index.html missing" && exit 1)
RUN test -d dist/public/assets || (echo "❌ Runtime error: assets missing" && exit 1)
RUN test -f server/app.ts || (echo "❌ Runtime error: server app missing" && exit 1)

# Switch to non-root user for security
USER bun

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD bun run health-check || exit 1

# Expose port (will be overridden by PaaS)
EXPOSE 8000

# Start the application with proper error handling
CMD ["sh", "-c", "bun run start:production || (echo '❌ Server failed to start' && exit 1)"]