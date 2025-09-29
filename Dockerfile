# Dockerfile for portfolio app with bundled SQLite database
# Switch to Debian-based Bun to avoid Alpine native-build hangs and pin to Bun 1.2.21
# Multi-stage: build (with optional tools) → runtime (slim)

# ---- Build stage ----
FROM oven/bun:1.2.21 AS build
WORKDIR /app

# Optional native build tooling to mirror local environment (usually not needed on Debian/glibc,
# but helpful if a dependency falls back to source build)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python-is-python3 \
    pkg-config \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Make install logs verbose to diagnose stalls and mirror local config
ENV npm_config_loglevel=verbose
ENV npm_config_jobs=4
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3

# Install dependencies with lockfile for reproducibility
COPY package.json bun.lock* ./
RUN echo ">>> bun install (build stage)" \
    && bun install --frozen-lockfile --verbose

# Copy config files needed for the build
COPY vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js ./
COPY drizzle.config.ts components.json ./

# Copy sources and bundled database
COPY client ./client
COPY server ./server
COPY drizzle ./drizzle
COPY database ./database

# Build SSR + client artifacts
ENV NODE_ENV=production
RUN echo ">>> build:production" \
    && bun run build:production

# ---- Prod deps stage (production-only node_modules) ----
FROM oven/bun:1.2.21 AS proddeps
WORKDIR /app
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python-is-python3 \
    pkg-config \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV npm_config_loglevel=verbose
ENV npm_config_jobs=4
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3
COPY package.json bun.lock* ./
RUN echo ">>> bun install (prod deps)" \
    && bun install --frozen-lockfile --production --verbose

# ---- Runtime stage ----
FROM oven/bun:1.2.21 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Bring package.json and lockfile for bun run scripts
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock* ./

# Use production node_modules generated in proddeps stage to avoid runtime node-gyp
COPY --from=build /app/node_modules ./node_modules

# Bring built artifacts and runtime code
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/database ./database

# Expose app port
EXPOSE 8000

# Start the application
CMD ["bun", "run", "start:production"]
