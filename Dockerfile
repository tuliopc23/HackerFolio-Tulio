# Stage 1: Build
FROM oven/bun:1 AS build

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22.x LTS (required by Vite, closest to local Node 24)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Copy dependency manifests first for better caching
COPY package.json bun.lock ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Fix platform-specific binaries - clean and reinstall
RUN rm -rf node_modules/.cache node_modules/esbuild node_modules/rollup && \
    bun install --force

# Copy source code
COPY . .

# Set production environment for build
ENV NODE_ENV=production

# Build the application
RUN bun run build:production

# Stage 2: Runtime
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Copy built application from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle ./drizzle

# Create database directory with proper permissions
RUN mkdir -p /app/database && \
    chown -R bun:bun /app

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=8000

# Switch to non-root user
USER bun

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Expose port (Koyeb will override with PORT env var)
EXPOSE ${PORT}

# Start the application
CMD ["bun", "run", "start:production"]
