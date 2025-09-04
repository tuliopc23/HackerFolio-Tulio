# syntax=docker/dockerfile:1
# Based on official Bun Docker template
# https://bun.sh/guides/ecosystem/docker

FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies into temp directory
# This will cache dependencies and only redownload if package files change
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all project files
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Set production environment for build
ENV NODE_ENV=production

# Build the application
RUN bun run build:production

# Final stage - copy production dependencies and built application
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/dist dist
COPY --from=prerelease /app/server server
COPY --from=prerelease /app/shared shared
COPY --from=prerelease /app/drizzle drizzle
COPY --from=prerelease /app/package.json .

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
