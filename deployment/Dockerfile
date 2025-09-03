# =============================================================================
# Multi-stage Docker build for HackerFolio-Tulio
# Optimized for Bun + React 19 + Vite + Elysia + SQLite
# =============================================================================

# Use latest stable Bun runtime with Alpine Linux for minimal size
FROM oven/bun:1-alpine AS base

# Install system dependencies needed for SQLite and native modules
RUN apk add --no-cache \
    sqlite \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set environment variables for better performance
ENV NODE_ENV=production
ENV BUN_INSTALL_CACHE_DIR=/tmp/.bun-install
ENV BUN_BUILD_CACHE_DIR=/tmp/.bun-build

# =============================================================================
# Dependencies stage - install and cache dependencies
# =============================================================================
FROM base AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY package.json bun.lock* ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# =============================================================================
# Builder stage - build the application
# =============================================================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build client (React 19 + Vite) and server (Elysia)
RUN bun run build:production

# =============================================================================
# Production runtime stage
# =============================================================================
FROM base AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 --ingroup bunuser bunuser

# Create directories for application and database
RUN mkdir -p /app/database /app/dist /app/drizzle && \
    chown -R bunuser:bunuser /app

# Copy production dependencies only
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=bunuser:bunuser /app/dist ./dist
COPY --from=builder --chown=bunuser:bunuser /app/server ./server
COPY --from=builder --chown=bunuser:bunuser /app/shared ./shared
COPY --from=builder --chown=bunuser:bunuser /app/drizzle ./drizzle
COPY --from=builder --chown=bunuser:bunuser /app/package.json ./

# Copy database migration files and create database directory structure
COPY --chown=bunuser:bunuser database/ ./database/
COPY --chown=bunuser:bunuser drizzle/ ./drizzle/

# Ensure database directory has proper permissions
RUN chown -R bunuser:bunuser /app/database

# Switch to non-root user
USER bunuser

# Create volume mount point for SQLite database persistence
VOLUME ["/app/database"]

# Environment variables for container operation
ENV HOST=0.0.0.0
ENV PORT=3001
ENV NODE_ENV=production
ENV DATABASE_URL=/app/database/portfolio.db

# Health check to ensure application is running correctly
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD bun run health-check || exit 1

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["bun", "run", "start:production"]