# Dockerfile for portfolio app with bundled SQLite database
# Two stages: build (with toolchain) → runtime (slim). Copy node_modules from build only.

# ---- Build stage ----
FROM oven/bun:1.2.21 AS build
WORKDIR /app

# Optional native build tooling to mirror local environment (ensures reliable native builds)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python-is-python3 \
    pkg-config \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Make install logs verbose and ensure node-gyp finds Python
ENV npm_config_loglevel=verbose
ENV npm_config_jobs=4
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3

# Install dependencies first for better Docker layer caching
COPY package.json bun.lock* ./
RUN echo ">>> bun install (build stage)" \
    && bun install --verbose \
    && bun pm trust --all

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

# ---- Runtime stage ----
FROM oven/bun:1.2.21 AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Bring package.json/lockfile for bun run scripts metadata
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock* ./

# Use node_modules from build stage to avoid runtime installs/node-gyp
COPY --from=build /app/node_modules ./node_modules

# Bring built artifacts and runtime code
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/database ./database
COPY verify-deployment.ts ./

# Ensure proper ownership/permissions for runtime user and SQLite DB
USER root
RUN chown -R bun:bun /app && chmod -R u+rwX,g+rwX /app/database || true
USER bun

# Port will be dynamically assigned by the platform via PORT env var

# Start the application with pre-flight verification
CMD ["sh", "-c", "bun verify-deployment.ts && bun run start:production"]
