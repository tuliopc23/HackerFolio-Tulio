# 🚀 Koyeb Dashboard Deployment (Recommended)

Since Koyeb has a **Bun preset** on their dashboard, this is the easiest way to
deploy!

## Step-by-Step Dashboard Deployment

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "feat: ready for Koyeb deployment"
git push origin main
```

### 2. Go to Koyeb Dashboard

- Visit: [https://app.koyeb.com/](https://app.koyeb.com/)
- Click **"Create App"**

### 3. Select Source

- Choose **"GitHub"**
- Connect your GitHub account if not already connected
- Select your repository: `hackerfolio-tulio`
- Branch: `main`

### 4. Choose Bun Preset ⭐

- Look for the **"Bun"** preset/template
- Click on it - this will auto-configure everything!
- If you don't see it, manually configure:
  - **Runtime**: Bun
  - **Build Command**: `bun run build:production`
  - **Run Command**: `bun run start:production`

### 5. Configure Settings

- **App Name**: `hackerfolio-tulio`
- **Service Name**: `web`
- **Region**: Choose closest to you (e.g., `fra` for Europe)
- **Instance Type**: `Nano` (cheapest)
- **Port**: `8000`

### 6. Environment Variables

Add these in the Environment Variables section:

**Required:**

- `NODE_ENV` = `production`
- `PORT` = `8000`
- `SESSION_SECRET` = `[generate 32-char random string]`

**Optional:**

- `GITHUB_TOKEN` = `[your GitHub token]`
- `LOG_LEVEL` = `info`

### 7. Health Check

- **Path**: `/api/health`
- **Port**: `8000`

### 8. Deploy!

- Click **"Deploy"**
- Wait 2-3 minutes for build and deployment
- Your app will be available at: `https://your-app-name.koyeb.app`

## Generate Session Secret

Use one of these methods:

```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## Expected Results

### ✅ **Build Process**

- Detects Bun runtime automatically
- Installs dependencies with `bun install`
- Builds with `bun run build:production`
- Creates optimized Docker image

### ✅ **Deployment**

- **URL**: `https://hackerfolio-tulio-[your-org].koyeb.app`
- **Build Time**: ~2-3 minutes
- **Cold Start**: <2 seconds
- **Cost**: FREE with credits!

### ✅ **Features Working**

- Homepage with SSR
- All pages load fast
- API endpoints work
- Terminal functionality
- Health check responds

## Troubleshooting

### Build Fails

- Check build logs in Koyeb dashboard
- Ensure `bun.lock` file is committed to repo
- Verify `bun run build:production` works locally

### App Won't Start

- Check runtime logs in dashboard
- Verify environment variables are set
- Ensure PORT=8000 is configured

### Health Check Fails

- Verify `/api/health` endpoint works locally
- Check if server is binding to 0.0.0.0:8000
- Review server startup logs

## Post-Deployment

### Test These URLs:

- `https://your-app.koyeb.app/` ✅
- `https://your-app.koyeb.app/api/health` ✅
- `https://your-app.koyeb.app/projects` ✅
- `https://your-app.koyeb.app/terminal` ✅

### Monitor Performance:

- Check Koyeb dashboard for metrics
- Monitor response times
- Watch resource usage
- Set up alerts if needed

## Why Dashboard > CLI

- ✅ **Bun Preset**: Auto-configures everything
- ✅ **Visual Interface**: Easier to configure
- ✅ **Better Error Messages**: Clear build/runtime logs
- ✅ **Auto-Detection**: Detects Bun automatically
- ✅ **No Complex Commands**: Point and click deployment

The dashboard approach is much more reliable than CLI for Bun apps! 🎯
