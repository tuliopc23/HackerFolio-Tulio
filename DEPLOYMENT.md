# Deployment Guide - Koyeb

## Quick Deploy

1. **Fork/Clone** this repository to your GitHub account

2. **Create App** on Koyeb:
   - Go to [Koyeb Dashboard](https://app.koyeb.com/)
   - Click "Create App"
   - Connect your GitHub repository
   - Select this repository and main branch

3. **Select Bun Preset**:
   - Look for **"Bun"** preset in the templates
   - Click on the Bun preset (this auto-configures everything!)
   - Or manually configure:
     - **Runtime**: Bun
     - **Build Command**: `bun run build:production`
     - **Run Command**: `bun run start:production`
     - **Port**: 8000

4. **Set Environment Variables**:
   - `SESSION_SECRET`: Generate a 32-character random string
   - `GITHUB_TOKEN`: Your GitHub personal access token (optional)
   - `CORS_ORIGINS`: Will be auto-set to your app URL

5. **Deploy**: Click "Deploy"

## Expected Costs

- **Nano Instance**: ~$2-5/month (pay-per-use)
- **Scale to Zero**: $0 when not used
- **No Database**: Using SQLite (included)
- **Total Estimated**: ~$0-5/month (with credits: FREE!)

## Build Process

Koyeb has native Bun support - no workarounds needed!

```bash
# Build commands (automated)
bun install --frozen-lockfile
bun run build:production
```

## Runtime

```bash
# Start command (automated)
bun run start:production
```

## Health Check

- **Endpoint**: `/api/health`
- **Expected Response**: `{"status": "ok", "timestamp": "..."}`

## Troubleshooting

### Build Fails

- Check build logs in Koyeb dashboard
- Ensure all dependencies are in package.json
- Verify build:production script works locally

### App Won't Start

- Check if PORT environment variable is set to 8000
- Verify start:production script
- Check server logs in Koyeb dashboard

### High Costs

- Use nano instance size (smallest)
- Enable scale-to-zero for cost savings
- Monitor usage in Koyeb dashboard

## Local Testing

Test the production build locally:

```bash
# Build and test
bun run build:production
bun run start:production

# Should serve on http://localhost:3001
```

## Alternative Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. Connect your GitHub repo to Koyeb
2. Auto-deploy on push to main branch
3. Zero configuration needed

### Method 2: Koyeb CLI

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login
koyeb login

# Deploy using koyeb.yaml
koyeb app deploy --config koyeb.yaml
```

## Environment Variables

Required:

- `NODE_ENV=production`
- `PORT=8000`
- `SESSION_SECRET=your-secret-here`

Optional:

- `GITHUB_TOKEN=your-token`
- `CORS_ORIGINS=https://your-app.koyeb.app`
- `LOG_LEVEL=info`

## Database

Uses SQLite file database (no external database needed):

- Database file: `./database/portfolio.db`
- Migrations run automatically on startup
- Data persists in app container storage

## Static Files

All static files are served by the Elysia server:

- Client build: `dist/public/`
- Assets: Images, CSS, JS served directly
- No separate static file hosting needed
