#!/bin/bash

# Koyeb Deployment Script for HackerFolio-Tulio
# This script helps deploy your app to Koyeb with proper configuration

set -e

echo "🚀 HackerFolio-Tulio Koyeb Deployment Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "koyeb.yaml" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Commit them before deploying."
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run tests and build
print_status "Running pre-deployment checks..."

echo "🔍 Validating environment..."
if ! bun run env:validate; then
    print_error "Environment validation failed"
    exit 1
fi
print_success "Environment validation passed"

echo "🧪 Running tests..."
if ! bun run test:run; then
    print_error "Tests failed"
    exit 1
fi
print_success "Tests passed"

echo "🏗️  Building for production..."
if ! bun run build:production; then
    print_error "Build failed"
    exit 1
fi
print_success "Build completed"

# Check if built files exist
if [ ! -f "dist/public/index.html" ]; then
    print_error "Built index.html not found at dist/public/index.html"
    exit 1
fi

if [ ! -d "dist/public/assets" ]; then
    print_error "Built assets directory not found at dist/public/assets"
    exit 1
fi

print_success "Built files verified"

# Get Koyeb app URL
echo ""
print_status "Koyeb Configuration"
echo "Current Koyeb app URL in config: https://curious-marlo-tulio-cunha-1a9cabe9.koyeb.app"
read -p "Is this correct? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    read -p "Enter your Koyeb app URL (e.g., https://your-app.koyeb.app): " KOYEB_URL
    if [ -n "$KOYEB_URL" ]; then
        print_status "Updating configuration files with new URL..."
        # Update koyeb.yaml
        sed -i.bak "s|https://curious-marlo-tulio-cunha-1a9cabe9.koyeb.app|$KOYEB_URL|g" koyeb.yaml
        # Update Dockerfile
        sed -i.bak "s|https://curious-marlo-tulio-cunha-1a9cabe9.koyeb.app|$KOYEB_URL|g" Dockerfile
        print_success "Configuration updated"
    fi
fi

# Commit and push
print_status "Preparing for deployment..."

git add .
git commit -m "feat: deploy to Koyeb with fixes for frontend rendering" || true

print_status "Pushing to GitHub..."
git push origin main

print_success "Code pushed to GitHub"

echo ""
print_status "Deployment Instructions"
echo "======================="
echo "1. Go to your Koyeb dashboard: https://app.koyeb.com/"
echo "2. Your app should automatically redeploy from the GitHub push"
echo "3. Wait for the build to complete (2-3 minutes)"
echo "4. Test these URLs:"
echo "   - Homepage: https://curious-marlo-tulio-cunha-1a9cabe9.koyeb.app/"
echo "   - Health: https://curious-marlo-tulio-cunha-1a9cabe9.koyeb.app/api/health"
echo "   - Projects: https://curious-marlo-tulio-cunha-1a9cabe9.koyeb.app/projects"

echo ""
print_status "Troubleshooting"
echo "==============="
echo "If the frontend still doesn't render:"
echo "1. Check Koyeb logs for errors"
echo "2. Verify environment variables in Koyeb dashboard"
echo "3. Test the health endpoint to see static file status"
echo "4. Check browser console for JavaScript errors"

echo ""
print_success "Deployment script completed!"
print_status "Monitor your deployment at: https://app.koyeb.com/"
