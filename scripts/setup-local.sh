#!/bin/bash

# RegForm Local Development Setup Script
# This script helps you set up local development environment

set -e  # Exit on error

echo "🚀 RegForm Local Development Setup"
echo "===================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    echo ""
    echo "Alternative: Install MongoDB directly with Homebrew:"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community@6.0"
    echo "  brew services start mongodb-community@6.0"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Check if docker-compose.dev.yml exists
if [ ! -f "docker-compose.dev.yml" ]; then
    echo -e "${RED}❌ docker-compose.dev.yml not found${NC}"
    echo "Please ensure you're running this script from the project root directory"
    exit 1
fi

# Setup environment file
echo "📝 Setting up environment file..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local already exists${NC}"
else
    if [ -f ".env.local.example" ]; then
        echo "Creating .env.local from .env.local.example..."
        cp .env.local.example .env.local
        echo -e "${GREEN}✅ Created .env.local${NC}"
        echo -e "${YELLOW}⚠️  Please review and update .env.local with your credentials${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local.example not found, skipping...${NC}"
    fi
fi

echo ""

# Check if MongoDB container is running
if docker ps | grep -q regform-mongodb-dev; then
    echo -e "${GREEN}✅ MongoDB is already running${NC}"
else
    echo "📦 Starting MongoDB container..."
    docker compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB started successfully${NC}"
        echo "   Connection: mongodb://127.0.0.1:27017/production"
        echo ""
        echo "⏳ Waiting for MongoDB to be ready..."
        sleep 5
    else
        echo -e "${RED}❌ Failed to start MongoDB${NC}"
        exit 1
    fi
fi

echo ""
echo "🔍 Checking MongoDB connection..."

# Test MongoDB connection (requires mongosh or mongo client)
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet mongodb://127.0.0.1:27017/production > /dev/null 2>&1; then
        MONGO_VERSION=$(mongosh --eval "db.version()" --quiet mongodb://127.0.0.1:27017/production 2>/dev/null)
        echo -e "${GREEN}✅ MongoDB is accessible (version: $MONGO_VERSION)${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB might still be starting up (this is normal)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  mongosh not installed, skipping connection test${NC}"
    echo "   Install with: brew install mongosh"
fi

echo ""
echo "📋 Current Setup:"
echo "   • MongoDB: mongodb://127.0.0.1:27017/production"
echo "   • Environment: $([ -f .env.local ] && echo '.env.local' || echo 'Not configured')"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "   Run: npm install"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Local development environment is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "   1. Review .env.local and update if needed"
echo "   2. Install dependencies: npm install"
echo "   3. Start dev server: npm run dev"
echo "   4. Visit: http://localhost:3000"
echo ""
echo "🔧 Useful Commands:"
echo "   • Stop MongoDB:     npm run db:stop"
echo "   • View logs:        npm run db:logs"
echo "   • Restart MongoDB:  docker compose -f docker-compose.dev.yml restart"
echo "   • Reset DB:         npm run db:reset (⚠️  deletes all data)"
echo ""
echo "📚 For production deployment, see: DOCKER.md"
echo ""
