#!/usr/bin/env bun
/**
 * Deployment Configuration Generator
 *
 * This script generates platform-specific deployment configurations:
 * - Railway deployment config
 * - Vercel deployment config
 * - Heroku deployment config
 * - Docker deployment config
 * - Generic cloud platform config
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
// Configuration is used in the deployment configs generation

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

function logInfo(message: string): void {
  console.log(colorize(`ℹ ${message}`, 'blue'))
}

function logSuccess(message: string): void {
  console.log(colorize(`✓ ${message}`, 'green'))
}

function logHeader(message: string): void {
  console.log('')
  console.log(colorize(`🚀 ${message}`, 'cyan'))
  console.log(colorize('='.repeat(message.length + 3), 'cyan'))
}

class DeploymentConfigGenerator {
  private projectRoot: string
  private deployDir: string

  constructor() {
    this.projectRoot = process.cwd()
    this.deployDir = join(this.projectRoot, 'deployment')

    // Ensure deployment directory exists
    if (!existsSync(this.deployDir)) {
      mkdirSync(this.deployDir, { recursive: true })
    }
  }

  async generateAll(): Promise<void> {
    logHeader('Deployment Configuration Generator')

    await this.generateRailwayConfig()
    await this.generateVercelConfig()
    await this.generateHerokuConfig()
    await this.generateDockerConfig()
    await this.generateGenericCloudConfig()
    await this.generateDeploymentGuide()

    logSuccess('All deployment configurations generated successfully!')
  }

  private async generateRailwayConfig(): Promise<void> {
    logInfo('Generating Railway deployment configuration...')

    const railwayConfig = {
      build: {
        builder: 'NIXPACKS',
        buildCommand: 'bun install && bun run build',
        watchPatterns: ['client/**', 'server/**', 'shared/**'],
      },
      deploy: {
        startCommand: 'bun run start',
        healthcheckPath: '/health',
        healthcheckTimeout: 300,
      },
      env: {
        NODE_ENV: 'production',
        PORT: '${{PORT}}',
        APP_URL: '${{RAILWAY_STATIC_URL}}',
        API_URL: '${{RAILWAY_STATIC_URL}}',
        DATABASE_URL: '${{DATABASE_URL}}',
        SESSION_SECRET: '${{SESSION_SECRET}}',
        CORS_ORIGINS: '${{RAILWAY_STATIC_URL}}',
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
      },
    }

    // Railway service configuration
    const railwayService = {
      version: '2',
      services: {
        app: {
          source: {
            repo: 'your-username/hackerfolio-tulio',
            branch: 'main',
          },
          build: {
            commands: ['bun install', 'bun run check:all', 'bun run build'],
          },
          start: {
            command: 'bun run start',
          },
          env: railwayConfig.env,
          healthcheck: {
            path: '/health',
            interval: 30,
            timeout: 10,
            retries: 3,
          },
          scaling: {
            minInstances: 1,
            maxInstances: 5,
          },
        },
      },
    }

    writeFileSync(join(this.deployDir, 'railway.json'), JSON.stringify(railwayConfig, null, 2))

    writeFileSync(
      join(this.deployDir, 'railway.service.json'),
      JSON.stringify(railwayService, null, 2)
    )

    // Railway environment template
    const railwayEnv = `# Railway Environment Variables
# Set these in your Railway project settings

# Required Variables
SESSION_SECRET=\${SESSION_SECRET}
DATABASE_URL=\${DATABASE_URL}

# Optional Variables
GITHUB_TOKEN=\${GITHUB_TOKEN}
SENTRY_DSN=\${SENTRY_DSN}

# Railway automatically provides:
# PORT - Application port
# RAILWAY_STATIC_URL - Public URL
# DATABASE_URL - Database connection (if service added)
`

    writeFileSync(join(this.deployDir, 'railway.env.example'), railwayEnv)

    logSuccess('Railway configuration generated')
  }

  private async generateVercelConfig(): Promise<void> {
    logInfo('Generating Vercel deployment configuration...')

    const vercelConfig = {
      version: 2,
      name: 'hackerfolio-tulio',
      builds: [
        {
          src: 'client/**',
          use: '@vercel/static-build',
          config: {
            buildCommand: 'cd ../.. && bun install && bun run build',
            outputDirectory: '../../dist/public',
          },
        },
        {
          src: 'server/app.ts',
          use: '@vercel/bun',
          config: {
            buildCommand: 'bun install && bun run build:server',
          },
        },
      ],
      routes: [
        {
          src: '/api/(.*)',
          dest: '/server/app.ts',
        },
        {
          src: '/(.*)',
          dest: '/dist/public/$1',
        },
      ],
      env: {
        NODE_ENV: 'production',
        SESSION_SECRET: '@session-secret',
        DATABASE_URL: '@database-url',
        CORS_ORIGINS: 'https://your-domain.vercel.app',
        LOG_LEVEL: 'info',
      },
      functions: {
        'server/app.ts': {
          runtime: 'bun',
        },
      },
    }

    writeFileSync(join(this.deployDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2))

    // Vercel build configuration
    const vercelBuild = {
      scripts: {
        'build:vercel': 'bun run build && bun run build:server',
      },
      vercel: {
        buildCommand: 'bun run build:vercel',
        outputDirectory: 'dist/public',
        installCommand: 'bun install',
      },
    }

    writeFileSync(join(this.deployDir, 'vercel.build.json'), JSON.stringify(vercelBuild, null, 2))

    logSuccess('Vercel configuration generated')
  }

  private async generateHerokuConfig(): Promise<void> {
    logInfo('Generating Heroku deployment configuration...')

    // Procfile
    const procfile = `web: bun run start
release: bun run db:migrate`

    writeFileSync(join(this.deployDir, 'Procfile'), procfile)

    // app.json for Heroku app configuration
    const appJson = {
      name: 'hackerfolio-tulio',
      description: 'Modern developer portfolio with GitHub integration',
      repository: 'https://github.com/your-username/hackerfolio-tulio',
      keywords: ['portfolio', 'developer', 'react', 'typescript', 'bun'],
      stack: 'heroku-22',
      buildpacks: [
        {
          url: 'https://github.com/oven-sh/heroku-buildpack-bun',
        },
      ],
      env: {
        NODE_ENV: {
          description: 'Environment mode',
          value: 'production',
          required: true,
        },
        SESSION_SECRET: {
          description: 'Secret key for session encryption (32+ characters)',
          generator: 'secret',
          required: true,
        },
        CORS_ORIGINS: {
          description: 'Allowed CORS origins (comma-separated)',
          value: 'https://your-app.herokuapp.com',
          required: true,
        },
        LOG_LEVEL: {
          description: 'Logging level',
          value: 'info',
        },
        GITHUB_TOKEN: {
          description: 'GitHub API token for repository integration',
          required: false,
        },
      },
      addons: [
        {
          plan: 'heroku-postgresql:mini',
          as: 'DATABASE',
        },
      ],
      scripts: {
        postdeploy: 'bun run db:migrate',
      },
    }

    writeFileSync(join(this.deployDir, 'app.json'), JSON.stringify(appJson, null, 2))

    // Heroku-specific package.json additions
    const herokuPackage = {
      engines: {
        bun: '>=1.0.0',
        node: '>=20.0.0',
      },
      scripts: {
        'heroku-postbuild': 'bun run build',
        'start:heroku': 'bun run start',
      },
    }

    writeFileSync(
      join(this.deployDir, 'heroku.package.json'),
      JSON.stringify(herokuPackage, null, 2)
    )

    logSuccess('Heroku configuration generated')
  }

  private async generateDockerConfig(): Promise<void> {
    logInfo('Generating Docker deployment configuration...')

    // Multi-stage Dockerfile
    const dockerfile = `# Multi-stage Docker build for HackerFolio
FROM oven/bun:1-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Build application
FROM base AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production image
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json ./

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
  CMD bun run health-check || exit 1

EXPOSE 3001

CMD ["bun", "run", "start"]`

    writeFileSync(join(this.deployDir, 'Dockerfile'), dockerfile)

    // Docker Compose for local development
    const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: deployment/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://postgres:password@db:5432/portfolio
      - SESSION_SECRET=your-super-secret-session-key-32-chars
      - CORS_ORIGINS=http://localhost:3001
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=portfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:`

    writeFileSync(join(this.deployDir, 'docker-compose.yml'), dockerCompose)

    // .dockerignore
    const dockerignore = `node_modules
.git
.vite
dist
coverage
*.log
.env
.env.local
.DS_Store
Thumbs.db`

    writeFileSync(join(this.deployDir, '.dockerignore'), dockerignore)

    logSuccess('Docker configuration generated')
  }

  private async generateGenericCloudConfig(): Promise<void> {
    logInfo('Generating generic cloud deployment configuration...')

    // Cloud platform agnostic configuration
    const cloudConfig = {
      runtime: 'bun',
      version: '1.0.0',
      build: {
        commands: ['bun install', 'bun run check:all', 'bun run build'],
        outputDirectory: 'dist',
      },
      start: {
        command: 'bun run start',
      },
      healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 10,
        retries: 3,
      },
      scaling: {
        minInstances: 1,
        maxInstances: 10,
        targetCPU: 70,
        targetMemory: 80,
      },
      environment: {
        required: ['NODE_ENV', 'SESSION_SECRET', 'CORS_ORIGINS'],
        optional: ['DATABASE_URL', 'GITHUB_TOKEN', 'SENTRY_DSN', 'LOG_LEVEL'],
      },
    }

    writeFileSync(join(this.deployDir, 'cloud-platform.json'), JSON.stringify(cloudConfig, null, 2))

    // Environment variable template
    const envTemplate = `# Production Environment Variables Template
# Copy and customize for your deployment platform

# Core Application
NODE_ENV=production
PORT=3001
APP_URL=https://your-domain.com
API_URL=https://your-domain.com

# Security
SESSION_SECRET=generate-32-char-secret-key-here
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Database (if using external database)
DATABASE_URL=postgresql://user:password@host:port/database

# Features (optional)
GITHUB_TOKEN=your-github-token-here
SENTRY_DSN=your-sentry-dsn-here

# Performance
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_COMPRESSION=true
API_CACHE_ENABLED=true
STATIC_CACHE_DURATION=86400`

    writeFileSync(join(this.deployDir, 'production.env.template'), envTemplate)

    logSuccess('Generic cloud configuration generated')
  }

  private async generateDeploymentGuide(): Promise<void> {
    logInfo('Generating deployment guide...')

    const deploymentGuide = `# HackerFolio Deployment Guide

This directory contains platform-specific deployment configurations for HackerFolio.

## Prerequisites

1. **Environment Variables**: Copy the appropriate \`.env.template\` and set your values
2. **Build**: Ensure the application builds successfully with \`bun run build\`
3. **Tests**: Verify all tests pass with \`bun run check:all\`

## Platform-Specific Deployments

### Railway
**Files**: \`railway.json\`, \`railway.service.json\`, \`railway.env.example\`

1. Push your code to GitHub
2. Connect your repository to Railway
3. Set environment variables from \`railway.env.example\`
4. Deploy automatically on push

**Recommended for**: Fast deployment, built-in database, simple scaling

### Vercel
**Files**: \`vercel.json\`, \`vercel.build.json\`

1. Install Vercel CLI: \`npm i -g vercel\`
2. Run \`vercel\` in project root
3. Set environment variables in Vercel dashboard
4. Configure custom domain if needed

**Recommended for**: Serverless deployment, edge functions, global CDN

### Heroku
**Files**: \`Procfile\`, \`app.json\`, \`heroku.package.json\`

1. Install Heroku CLI
2. Create app: \`heroku create your-app-name\`
3. Add PostgreSQL: \`heroku addons:create heroku-postgresql:mini\`
4. Set environment variables: \`heroku config:set KEY=value\`
5. Deploy: \`git push heroku main\`

**Recommended for**: Traditional deployment, add-ons ecosystem, process management

### Docker
**Files**: \`Dockerfile\`, \`docker-compose.yml\`, \`.dockerignore\`

#### Local Development
\`\`\`bash
docker-compose up -d
\`\`\`

#### Production Deployment
\`\`\`bash
docker build -t hackerfolio .
docker run -p 3001:3001 --env-file .env hackerfolio
\`\`\`

**Recommended for**: Container orchestration, Kubernetes, self-hosted

### Generic Cloud Platforms
**Files**: \`cloud-platform.json\`, \`production.env.template\`

Use these as templates for other cloud providers like:
- AWS (Elastic Beanstalk, ECS, Lambda)
- Google Cloud (App Engine, Cloud Run)
- Azure (App Service, Container Instances)
- DigitalOcean (App Platform)

## Security Checklist

Before deploying to production:

- [ ] Run security validation: \`bun run server/scripts/production-hardening.ts\`
- [ ] Set unique SESSION_SECRET (32+ characters)
- [ ] Configure HTTPS URLs
- [ ] Set appropriate CORS_ORIGINS
- [ ] Enable compression and caching
- [ ] Configure error monitoring (Sentry)
- [ ] Set up database backups
- [ ] Configure environment-specific logging

## Performance Optimization

1. **Build Optimization**:
   - Minification enabled
   - Source maps disabled in production
   - Tree shaking configured

2. **Runtime Optimization**:
   - Enable compression
   - Configure caching headers
   - Use CDN for static assets
   - Enable API response caching

3. **Monitoring**:
   - Set up application monitoring
   - Configure error tracking
   - Monitor response times
   - Set up alerts for failures

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors: \`bun run check:types\`
   - Verify all dependencies: \`bun install\`
   - Run full check: \`bun run check:all\`

2. **Runtime Errors**:
   - Check environment variables
   - Verify database connectivity
   - Check application logs

3. **Performance Issues**:
   - Enable compression
   - Optimize database queries
   - Use appropriate caching strategies

### Support

- GitHub Issues: [Repository Issues](https://github.com/your-username/hackerfolio-tulio/issues)
- Documentation: [Project README](../README.md)
- Configuration Guide: [Configuration Documentation](../docs/configuration.md)

## Next Steps

1. Choose your deployment platform
2. Copy the appropriate configuration files
3. Set up environment variables
4. Test deployment in staging environment
5. Deploy to production
6. Set up monitoring and alerts

Happy deploying! 🚀`

    writeFileSync(join(this.deployDir, 'README.md'), deploymentGuide)

    logSuccess('Deployment guide generated')
  }
}

// Generate all deployment configurations
const generator = new DeploymentConfigGenerator()
await generator.generateAll()

console.log('')
console.log(colorize('🎉 Deployment configurations ready!', 'green'))
console.log(colorize('📁 Check the deployment/ directory for platform-specific configs', 'blue'))
console.log(colorize('📖 Read deployment/README.md for detailed instructions', 'blue'))
