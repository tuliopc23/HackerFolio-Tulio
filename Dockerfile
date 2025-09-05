# syntax=docker/dockerfile:1
# Based on official Bun Docker template
# https://bun.sh/guides/ecosystem/docker

FROM oven/bun:1 AS base
WORKDIR /app

# Build stage - install all dependencies and build
FROM base AS build
# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Install all dependencies - bun will handle native binaries correctly
RUN bun install --frozen-lockfile

# Fix esbuild binary version mismatch caused by @esbuild-kit/core-utils
# Remove the old binary and ensure the correct version is used
RUN rm -rf node_modules/@esbuild-kit/core-utils/node_modules
RUN bun remove esbuild
# Ensure we get the correct Linux ARM64 binary
RUN bun add -D esbuild@0.25.9 @esbuild/linux-arm64

# Add native binaries for Linux ARM64
RUN bun add -D @rollup/rollup-linux-arm64-gnu lightningcss-linux-arm64-gnu

# Copy all project files
COPY . .

# Set production environment for build
ENV NODE_ENV=production

# Build the application
RUN bun run build:production

# Production stage - minimal image with only production deps
FROM base AS release
# Install dependencies needed for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built application from build stage
COPY --from=build /app/dist dist
COPY --from=build /app/server server
COPY --from=build /app/shared shared
COPY --from=build /app/drizzle drizzle

# Create database directory
RUN mkdir -p database && chown -R bun:bun /app

# Set user and environment
USER bun
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the app
ENTRYPOINT ["bun", "run", "start:production"]
