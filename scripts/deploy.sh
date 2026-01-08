#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Configuration - adjust PROJECT_DIR based on your server
PROJECT_DIR="${PROJECT_DIR:-regform}"
BRANCH="${BRANCH:-main}"

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory $PROJECT_DIR not found${NC}"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

# Backup current .env
echo -e "${YELLOW}📦 Backing up environment file...${NC}"
if [ -f .env ]; then
    cp .env .env.backup
    echo -e "${GREEN}✅ Environment backed up${NC}"
fi

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from ${BRANCH}...${NC}"
git fetch origin
git reset --hard origin/$BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Code updated${NC}"

# Restore .env if it was backed up
if [ -f .env.backup ]; then
    cp .env.backup .env
    echo -e "${GREEN}✅ Environment restored${NC}"
fi

# Stop PM2 process during build to avoid conflicts
echo -e "${YELLOW}🛑 Stopping PM2 process...${NC}"
if pm2 describe regform &>/dev/null; then
    pm2 stop regform
    echo -e "${GREEN}✅ PM2 process stopped${NC}"
fi

# Clean build artifacts
echo -e "${YELLOW}🧹 Cleaning build artifacts...${NC}"
rm -rf .next

# Install dependencies (including devDependencies for build)
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Verify build output exists
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build directory .next not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed successfully${NC}"

# Remove devDependencies to save space (optional)
# echo -e "${YELLOW}🧹 Removing dev dependencies...${NC}"
# npm prune --production

# Restart application with PM2
echo -e "${YELLOW}🔄 Starting application...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found, installing...${NC}"
    npm install -g pm2
fi

# Delete old process and start fresh
if pm2 describe regform &>/dev/null; then
    echo -e "${YELLOW}Deleting old PM2 process...${NC}"
    pm2 delete regform
fi

# Start with PM2
echo -e "${YELLOW}Starting new PM2 process...${NC}"
pm2 start npm --name regform -- start

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Application start failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Application started${NC}"

# Wait a few seconds for the app to start
sleep 3

# Check if the app is actually running
if ! pm2 describe regform &>/dev/null || ! pm2 describe regform | grep -q "online"; then
    echo -e "${RED}❌ Application is not running properly${NC}"
    pm2 logs regform --lines 50 --nostream
    exit 1
fi

# Save PM2 process list
pm2 save

# Show status
echo -e "${BLUE}📊 Application status:${NC}"
pm2 status regform
pm2 logs regform --lines 20 --nostream

echo -e "${GREEN}✅ Deployment completed at $(date)${NC}"
echo -e "${BLUE}📖 View logs with: pm2 logs regform${NC}"
