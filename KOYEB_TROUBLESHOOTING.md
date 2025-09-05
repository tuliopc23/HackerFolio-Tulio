# Koyeb Deployment Troubleshooting Guide

## Frontend Not Rendering Issue - SOLVED ✅

### Problem
The frontend doesn't render on Koyeb deployment while working locally with `bun run dev`.

### Root Causes Identified
1. **Fighting PaaS Benefits**: Hardcoded URLs instead of dynamic detection
2. **Static File Serving**: Path resolution issues in containerized environment
3. **Missing Logging**: Insufficient debugging information

### Solutions Applied - PaaS-Friendly Approach

#### 1. Dynamic URL Detection (No More Hardcoded URLs!)
**The app now auto-detects its environment:**
- ✅ **Koyeb**: Auto-detects from environment
- ✅ **Railway**: Uses `RAILWAY_STATIC_URL`
- ✅ **Vercel**: Uses `VERCEL_URL`
- ✅ **Heroku**: Uses `HEROKU_APP_NAME`
- ✅ **Generic PaaS**: Allows HTTPS origins dynamically

**No more hardcoded URLs in config files!**

#### 2. Enhanced Static File Serving
- Added comprehensive logging for static file detection
- Improved error handling for asset serving
- Added manual fallback for asset routes

#### 3. Enhanced Health Check
- Added static file verification to `/api/health`
- Includes environment and static file status

### Deployment Steps

#### Option 1: Use the Deployment Script
```bash
./scripts/deploy-koyeb.sh
```

#### Option 2: Manual Deployment
1. **Update your Koyeb app URL** (if different):
   ```bash
   # Replace with your actual Koyeb app URL
   sed -i 's|hackerfolio-tulio-tuliopinheirocunha|YOUR-APP-NAME|g' koyeb.yaml Dockerfile
   ```

2. **Build and test locally**:
   ```bash
   bun run build:production
   bun run preview
   ```

3. **Deploy**:
   ```bash
   git add .
   git commit -m "fix: resolve frontend rendering on Koyeb"
   git push origin main
   ```

### Verification Steps

1. **Check Health Endpoint**:
   ```bash
   curl https://your-app.koyeb.app/api/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "data": {
       "status": "ok",
       "staticFiles": {
         "indexHtml": true,
         "assetsDir": true
       }
     }
   }
   ```

2. **Test Frontend Routes**:
   - Homepage: `https://your-app.koyeb.app/`
   - Projects: `https://your-app.koyeb.app/projects`
   - About: `https://your-app.koyeb.app/about`

3. **Check Browser Console**:
   - No 404 errors for assets
   - No CORS errors
   - React app loads successfully

### Common Issues & Solutions

#### Issue: "Failed to fetch" errors
**Cause**: CORS misconfiguration
**Solution**: Verify CORS_ORIGINS matches your Koyeb app URL exactly

#### Issue: 404 for assets
**Cause**: Static file serving not working
**Solution**: Check Koyeb logs for static directory detection messages

#### Issue: Blank page with no errors
**Cause**: JavaScript bundle not loading
**Solution**: 
1. Check network tab for failed asset requests
2. Verify `/assets/` routes are accessible
3. Check if index.html contains correct asset references

#### Issue: SSR errors
**Cause**: Server-side rendering issues
**Solution**: Check Koyeb logs for SSR error messages

### Monitoring & Debugging

#### Koyeb Logs
Access logs at: `https://app.koyeb.com/apps/your-app/services/web/logs`

Look for these log messages:
- `✅ Using static directory: ./dist/public`
- `📁 Assets directory exists: true`
- `🌐 Request: /` (for page requests)
- `📄 Serving HTML for: /` (for successful renders)

#### Health Check Monitoring
Set up monitoring for: `https://your-app.koyeb.app/api/health`

Expected response includes:
```json
{
  "staticFiles": {
    "indexHtml": true,
    "assetsDir": true
  }
}
```

### Performance Optimizations

1. **Enable Compression**: Already configured in environment
2. **Asset Caching**: Configured with long cache headers
3. **Chunk Splitting**: Optimized in Vite config
4. **Scale to Zero**: Configured in koyeb.yaml for cost savings

### Next Steps After Deployment

1. **Custom Domain**: Configure in Koyeb dashboard
2. **Environment Secrets**: Update SESSION_SECRET and GITHUB_TOKEN
3. **Monitoring**: Set up uptime monitoring
4. **Analytics**: Enable if needed via environment variables

### Support

If issues persist:
1. Check Koyeb status page
2. Review Koyeb documentation
3. Check GitHub repository for updates
4. Contact Koyeb support with deployment logs
