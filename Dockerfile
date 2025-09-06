# Simple Dockerfile for portfolio app with bundled SQLite database
# Alpine base as requested
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 py3-pip make g++

# Install dependencies using the Bun lock file
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code and database (the SQLite file is bundled with the app)
COPY . .

# Build the application (includes database bundling)
RUN NODE_ENV=production bun run build:production

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start the application
CMD ["bun", "run", "start:production"]
