# Dockerfile for HackerFolio-Tulio (Bun + React) on Koyeb
#
# Overview:
# This multi-stage Dockerfile builds both the client and server portions of
# the HackerFolio-Tulio project using the Bun runtime. It follows
# Koyeb's recommendation of building from a Dockerfile rather than relying
# on buildpacks. The first stage installs dependencies and compiles the
# front-end and server for production. The final stage installs only
# production dependencies and copies the built assets and necessary source
# files. The resulting image exposes the application on the port provided
# by the PORT environment variable (or defaults to 8000) and starts the
# server using the production script.

# -------- Stage 1: Build --------
FROM oven/bun:1 as build

# Set working directory
WORKDIR /app

# Copy dependency manifests first. Bun will detect and use `bun.lock`
# automatically. If other lockfiles are present (e.g. bun.lockb), adjust
# this list accordingly.
COPY bun.lock package.json ./

# Install dependencies with a frozen lockfile to ensure reproducible builds
RUN bun install --frozen-lockfile

# Copy the rest of the repository
COPY . .

# Set production environment for build commands
ENV NODE_ENV=production

# Build both client and server. The `build` script defined in the root
# package.json runs `build:client` and `build:server` to generate the
# compiled assets in the `dist` folder.
RUN bun run build

# -------- Stage 2: Runtime --------
FROM oven/bun:1 AS runtime

WORKDIR /app

# Copy dependency manifests to install only production dependencies
COPY bun.lock package.json ./
RUN bun install --production --frozen-lockfile

# Copy only the built output and necessary source files from the build stage.
# The application reads from the server source code at runtime (e.g.
# `server/app.ts`) and also serves prebuilt assets from `dist`.
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/database ./database

# Expose the port configured at runtime. Koyeb will set the `PORT`
# environment variable automatically, but we provide a default of 8000.
ARG PORT
ENV NODE_ENV=production
EXPOSE ${PORT:-8000}

# Start the server in production mode. The `start:production` script
# sets `NODE_ENV=production` and runs `bun run start`, which validates the
# environment and launches `server/app.ts`.
CMD ["bun", "run", "start:production"]
