# HackerFolio Deployment Guide

This directory contains platform-specific deployment configurations for HackerFolio.

## Prerequisites

1. **Environment Variables**: Copy the appropriate `.env.template` and set your values
2. **Build**: Ensure the application builds successfully with `bun run build`
3. **Tests**: Verify all tests pass with `bun run check:all`

## Platform-Specific Deployments

### Railway
**Files**: `railway.json`, `railway.service.json`, `railway.env.example`

1. Push your code to GitHub
2. Connect your repository to Railway
3. Set environment variables from `railway.env.example`
4. Deploy automatically on push

**Recommended for**: Fast deployment, built-in database, simple scaling

### Vercel
**Files**: `vercel.json`, `vercel.build.json`

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Set environment variables in Vercel dashboard
4. Configure custom domain if needed

**Recommended for**: Serverless deployment, edge functions, global CDN

### Heroku
**Files**: `Procfile`, `app.json`, `heroku.package.json`

1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
4. Set environment variables: `heroku config:set KEY=value`
5. Deploy: `git push heroku main`

**Recommended for**: Traditional deployment, add-ons ecosystem, process management

### Docker
**Files**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`

#### Local Development
```bash
docker-compose up -d
```

#### Production Deployment
```bash
docker build -t hackerfolio .
docker run -p 3001:3001 --env-file .env hackerfolio
```

**Recommended for**: Container orchestration, Kubernetes, self-hosted

### Generic Cloud Platforms
**Files**: `cloud-platform.json`, `production.env.template`

Use these as templates for other cloud providers like:
- AWS (Elastic Beanstalk, ECS, Lambda)
- Google Cloud (App Engine, Cloud Run)
- Azure (App Service, Container Instances)
- DigitalOcean (App Platform)

## Security Checklist

Before deploying to production:

- [ ] Run security validation: `bun run server/scripts/production-hardening.ts`
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
   - Check TypeScript errors: `bun run check:types`
   - Verify all dependencies: `bun install`
   - Run full check: `bun run check:all`

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

Happy deploying! 🚀