#!/bin/bash

# MERN Blog Deployment Script
# This script handles the deployment process for both frontend and backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mern-blog"
BACKEND_DIR="server"
FRONTEND_DIR="client"
DEPLOY_ENV=${1:-production}

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME} (${DEPLOY_ENV})${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Load environment variables
if [ -f ".env.${DEPLOY_ENV}" ]; then
    echo -e "${BLUE}📄 Loading environment variables from .env.${DEPLOY_ENV}${NC}"
    export $(cat .env.${DEPLOY_ENV} | grep -v '^#' | xargs)
elif [ -f ".env" ]; then
    echo -e "${BLUE}📄 Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    print_warning "No environment file found"
fi

# Backend deployment
echo -e "${BLUE}🔧 Deploying backend...${NC}"
cd ${BACKEND_DIR}

# Install dependencies
echo "Installing backend dependencies..."
npm ci --only=production

# Run tests if in CI environment
if [ "$CI" = "true" ]; then
    echo "Running backend tests..."
    npm test
fi

# Create necessary directories
mkdir -p logs uploads

print_status "Backend deployment completed"
cd ..

# Frontend deployment
echo -e "${BLUE}🎨 Deploying frontend...${NC}"
cd ${FRONTEND_DIR}

# Install dependencies
echo "Installing frontend dependencies..."
npm ci

# Build for production
echo "Building frontend for production..."
npm run build

# Run tests if in CI environment
if [ "$CI" = "true" ]; then
    echo "Running frontend tests..."
    npm test -- --coverage --watchAll=false
fi

print_status "Frontend build completed"
cd ..

# Docker deployment (if Docker is available)
if command_exists docker && command_exists docker-compose; then
    echo -e "${BLUE}🐳 Docker deployment available${NC}"
    
    if [ "$DEPLOY_ENV" = "docker" ]; then
        echo "Starting Docker deployment..."
        cd deployment/docker
        
        # Build and start containers
        docker-compose down
        docker-compose build
        docker-compose up -d
        
        # Wait for services to be ready
        echo "Waiting for services to start..."
        sleep 30
        
        # Health check
        if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
            print_status "Backend health check passed"
        else
            print_error "Backend health check failed"
            exit 1
        fi
        
        if curl -f http://localhost:80 > /dev/null 2>&1; then
            print_status "Frontend health check passed"
        else
            print_error "Frontend health check failed"
            exit 1
        fi
        
        print_status "Docker deployment completed successfully"
        echo -e "${GREEN}🎉 Application is running at:${NC}"
        echo -e "${GREEN}   Frontend: http://localhost${NC}"
        echo -e "${GREEN}   Backend:  http://localhost:5000${NC}"
        echo -e "${GREEN}   Health:   http://localhost:5000/api/health${NC}"
        
        cd ../..
        exit 0
    fi
fi

# PM2 deployment (for production servers)
if command_exists pm2; then
    echo -e "${BLUE}⚡ PM2 deployment available${NC}"
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        echo "Starting PM2 deployment..."
        
        # Stop existing processes
        pm2 stop ${PROJECT_NAME}-backend || true
        pm2 delete ${PROJECT_NAME}-backend || true
        
        # Start backend with PM2
        cd ${BACKEND_DIR}
        pm2 start server.js --name "${PROJECT_NAME}-backend" --env production
        cd ..
        
        print_status "PM2 deployment completed"
    fi
fi

# Health checks
echo -e "${BLUE}🏥 Running health checks...${NC}"

# Check if backend is running
if [ -n "$BACKEND_URL" ]; then
    HEALTH_URL="${BACKEND_URL}/api/health"
else
    HEALTH_URL="http://localhost:5000/api/health"
fi

echo "Checking backend health at ${HEALTH_URL}..."
for i in {1..10}; do
    if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
        print_status "Backend is healthy"
        break
    else
        if [ $i -eq 10 ]; then
            print_error "Backend health check failed after 10 attempts"
            exit 1
        fi
        echo "Attempt $i failed, retrying in 5 seconds..."
        sleep 5
    fi
done

# Deployment summary
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📊 Deployment Summary:${NC}"
echo -e "${GREEN}   Environment: ${DEPLOY_ENV}${NC}"
echo -e "${GREEN}   Backend: ✅ Deployed${NC}"
echo -e "${GREEN}   Frontend: ✅ Built${NC}"
echo -e "${GREEN}   Health Check: ✅ Passed${NC}"

if [ -n "$FRONTEND_URL" ]; then
    echo -e "${GREEN}   Frontend URL: ${FRONTEND_URL}${NC}"
fi

if [ -n "$BACKEND_URL" ]; then
    echo -e "${GREEN}   Backend URL: ${BACKEND_URL}${NC}"
fi

echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "${BLUE}   1. Monitor application logs${NC}"
echo -e "${BLUE}   2. Set up monitoring and alerting${NC}"
echo -e "${BLUE}   3. Configure backup procedures${NC}"
echo -e "${BLUE}   4. Update DNS records if needed${NC}"

print_status "Deployment script completed"