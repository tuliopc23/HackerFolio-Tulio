# Docker Deployment Guide for HackerFolio-Tulio

This directory contains optimized Docker configurations for deploying HackerFolio-Tulio, a modern full-stack application built with Bun + React 19 + Vite + Elysia + SQLite.

## 🏗️ Architecture Overview

**Tech Stack:**
- **Runtime:** Bun (JavaScript/TypeScript runtime)
- **Frontend:** React 19 + Vite
- **Backend:** Elysia (Bun web framework)
- **Database:** SQLite with Drizzle ORM
- **Styling:** Tailwind CSS v4

**Container Optimizations:**
- Multi-stage Docker build for minimal image size
- Efficient layer caching for faster rebuilds
- SQLite database persistence via volumes
- Security-hardened with non-root user
- Health checks and restart policies
- Universal compatibility across container platforms

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build optimized for Bun + React 19 + Elysia |
| `docker-compose.yml` | Production deployment with SQLite persistence |
| `docker-compose.dev.yml` | Development environment with live reload |
| `production.env.template` | Environment variables template for production |
| `.dockerignore` | Optimized build context exclusions |
| `verify-docker.sh` | Comprehensive test script for Docker setup |

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 1GB+ available memory
- 2GB+ available disk space

### Production Deployment

1. **Configure Environment**
   ```bash
   cp production.env.template .env
   # Edit .env with your production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f deployment/docker-compose.yml up -d
   ```

3. **Verify Deployment**
   ```bash
   # Check application health
   curl http://localhost:3001/api/health
   
   # View logs
   docker-compose -f deployment/docker-compose.yml logs -f
   ```

### Development Environment

```bash
# Start development environment with live reload
docker-compose -f deployment/docker-compose.dev.yml up -d

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 🧪 Testing & Verification

Run the comprehensive verification script:

```bash
./deployment/verify-docker.sh
```

This script tests:
- ✅ Docker installation and daemon
- ✅ Project structure and required files
- ✅ Docker build process
- ✅ Container startup and health checks
- ✅ Docker Compose configuration
- ✅ Application endpoints

## 🌐 Platform Deployment

### Railway
```bash
# Connect your GitHub repo to Railway
# Railway will automatically detect and use the Dockerfile
railway deploy
```

### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku container:push web --app your-app-name
heroku container:release web --app your-app-name
```

### Fly.io
```bash
# Install flyctl and create app
fly launch --dockerfile deployment/Dockerfile
fly deploy
```

### Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/hackerfolio-tulio
gcloud run deploy --image gcr.io/PROJECT_ID/hackerfolio-tulio --port 3001
```

### AWS ECS/Fargate
```bash
# Push to ECR and deploy with ECS CLI
aws ecr get-login-password | docker login --username AWS --password-stdin ECR_URI
docker build -f deployment/Dockerfile -t hackerfolio-tulio .
docker tag hackerfolio-tulio:latest ECR_URI/hackerfolio-tulio:latest
docker push ECR_URI/hackerfolio-tulio:latest
```

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set build command: `docker build -f deployment/Dockerfile`
3. Set run command: `bun run start:production`
4. Configure environment variables from `production.env.template`

### Render.com
1. Connect GitHub repository
2. Choose Docker as environment
3. Set Dockerfile path: `deployment/Dockerfile`
4. Configure environment variables

## 🗄️ Database Management

### SQLite Persistence
The application uses SQLite with Docker volumes for persistence:

```yaml
volumes:
  - sqlite_data:/app/database
```

### Database Operations
```bash
# Access database CLI
docker-compose exec app bun run db:cli

# Run migrations
docker-compose exec app bun run db:migrate

# Open Drizzle Studio
docker-compose exec app bun run db:studio
```

### Backup & Restore
```bash
# Backup database
docker cp $(docker-compose ps -q app):/app/database/portfolio.db ./backup.db

# Restore database
docker cp ./backup.db $(docker-compose ps -q app):/app/database/portfolio.db
```

## 🔧 Configuration

### Environment Variables

Key production variables (see `production.env.template` for complete list):

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `HOST` | Yes | Set to `0.0.0.0` for containers |
| `PORT` | Yes | Application port (default: 3001) |
| `APP_URL` | Yes | Your domain URL |
| `SESSION_SECRET` | Yes | 32+ character secret key |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `DATABASE_URL` | No | SQLite path (default: `/app/database/portfolio.db`) |

### Resource Limits

Default resource limits (adjust in docker-compose.yml):
- CPU: 1.0 cores (max), 0.25 cores (reserved)
- Memory: 512MB (max), 256MB (reserved)

## 🔍 Monitoring & Troubleshooting

### Health Checks
- **Endpoint:** `GET /api/health`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3

### Logging
```bash
# View application logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f app

# View logs with timestamps
docker-compose logs -f -t app
```

### Common Issues

**Build Failures:**
- Ensure 2GB+ available disk space
- Check Docker daemon is running
- Verify network connectivity for package downloads

**Container Won't Start:**
- Check environment variables
- Verify port 3001 isn't already in use
- Check database volume permissions

**Database Issues:**
- Ensure database volume is properly mounted
- Check file permissions on host system
- Verify SQLite file isn't corrupted

## 🔒 Security Features

- ✅ Non-root user execution
- ✅ Security headers (HSTS, CSP)
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation
- ✅ Minimal attack surface

## 📊 Performance Optimizations

- ✅ Multi-stage builds for minimal image size
- ✅ Efficient layer caching
- ✅ Production optimizations (minification, compression)
- ✅ Static asset serving
- ✅ Connection pooling
- ✅ Response caching

## 🆘 Support

For issues specific to Docker deployment:
1. Run `./deployment/verify-docker.sh` to diagnose problems
2. Check container logs: `docker-compose logs -f`
3. Verify environment configuration
4. Test locally before deploying to production

For application-specific issues, refer to the main project documentation.

---

**Built with ❤️ for universal container deployment compatibility**