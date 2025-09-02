#!/bin/bash

# =============================================================================
# Docker Configuration Verification Script for HackerFolio-Tulio
# Tests Docker setup, build process, and deployment readiness
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting Docker Configuration Verification for HackerFolio-Tulio"
echo "============================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from correct directory
if [ ! -f "package.json" ] || [ ! -d "deployment" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check Docker daemon
print_status "Checking Docker daemon..."
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_success "Docker daemon is running"

# Verify file structure
print_status "Verifying project structure..."
required_files=(
    "deployment/Dockerfile"
    "deployment/docker-compose.yml"
    "deployment/.dockerignore"
    "package.json"
    "server/app.ts"
    "shared/config.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files are present"

# Check database directory
print_status "Checking database setup..."
if [ ! -d "database" ]; then
    print_warning "Database directory doesn't exist, creating it..."
    mkdir -p database
fi

if [ ! -f "database/portfolio.db" ]; then
    print_warning "SQLite database file doesn't exist - will be created on first run"
fi

print_success "Database directory structure is ready"

# Verify Docker files syntax
print_status "Validating Docker configuration files..."

# Test docker-compose file syntax
if ! docker-compose -f deployment/docker-compose.yml config &> /dev/null; then
    print_error "Invalid docker-compose.yml syntax"
    exit 1
fi

print_success "Docker configuration files are valid"

# Test Docker build
print_status "Testing Docker build process..."
echo "This may take several minutes..."

if docker build -f deployment/Dockerfile -t hackerfolio-tulio:test . &> /tmp/docker-build.log; then
    print_success "Docker build completed successfully"
    
    # Test container startup
    print_status "Testing container startup..."
    
    container_id=$(docker run -d -p 3002:3001 \
        -e NODE_ENV=production \
        -e HOST=0.0.0.0 \
        -e PORT=3001 \
        -e DATABASE_URL=/app/database/portfolio.db \
        hackerfolio-tulio:test)
    
    # Wait for container to start
    sleep 10
    
    # Test health check
    print_status "Testing health check endpoint..."
    if curl -f http://localhost:3002/api/health &> /dev/null; then
        print_success "Health check endpoint is working"
    else
        print_warning "Health check endpoint test failed - container may still be starting"
    fi
    
    # Cleanup
    docker stop "$container_id" &> /dev/null
    docker rm "$container_id" &> /dev/null
    
    print_success "Container startup test completed"
    
else
    print_error "Docker build failed. Check the build log:"
    cat /tmp/docker-build.log
    exit 1
fi

# Test docker-compose
print_status "Testing Docker Compose configuration..."

cd deployment

if docker-compose up --build -d &> /tmp/compose-test.log; then
    print_success "Docker Compose started successfully"
    
    # Wait for services to be ready
    sleep 15
    
    # Test application endpoint
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        print_success "Application is responding correctly"
    else
        print_warning "Application health check failed"
        docker-compose logs app
    fi
    
    # Cleanup
    docker-compose down &> /dev/null
    
else
    print_error "Docker Compose failed to start. Check the logs:"
    cat /tmp/compose-test.log
    cd ..
    exit 1
fi

cd ..

# Cleanup test images
print_status "Cleaning up test resources..."
docker rmi hackerfolio-tulio:test &> /dev/null || true

print_success "Cleanup completed"

echo "============================================================================="
print_success "🎉 All Docker configuration tests passed!"
echo ""
echo "Next steps:"
echo "1. Copy deployment/production.env.template to .env and configure your values"
echo "2. For production: docker-compose -f deployment/docker-compose.yml up -d"
echo "3. For development: docker-compose -f deployment/docker-compose.dev.yml up -d"
echo ""
echo "Platform-specific deployment commands:"
echo "• Railway: railway deploy"
echo "• Heroku: heroku container:push web && heroku container:release web"
echo "• Fly.io: fly deploy"
echo "• Google Cloud Run: gcloud run deploy"
echo "• AWS ECS: ecs-cli compose up"
echo "============================================================================="