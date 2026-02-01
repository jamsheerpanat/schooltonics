#!/bin/bash

# OctoSchool Engine - Full Stack Development Runner (Pro Version)
# This script intelligently manages ports and starts the full stack.

# Root directory of the project
ROOT_DIR=$(pwd)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Initializing OctoSchool Engine...${NC}"

# Function to clean up a port
cleanup_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Port $port is in use (PID $pid). Cleaning up...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Function to handle script termination
total_cleanup() {
    echo -e "\n${BLUE}🛑 Stopping development environment...${NC}"
    # Kill background jobs started by THIS script
    kill $(jobs -p) 2>/dev/null
    exit
}

trap total_cleanup SIGINT

# 1. Port Management
echo -e "${BLUE}🔍 Checking port availability...${NC}"
cleanup_port 8000 # Laravel
cleanup_port 3000 # Next.js

# 2. Infra Check
if ! lsof -i :5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Postgres (port 5432) is not responding.${NC}"
    echo -e "   Please ensure Docker is running and execute: ${BLUE}cd infra/local && docker compose up -d${NC}"
fi

# 3. Start Laravel Backend
echo -e "${GREEN}👉 Starting Backend (Laravel) on http://127.0.0.1:8000...${NC}"
cd "$ROOT_DIR/apps/api" || exit 1
php artisan serve --port=8000 &

# 4. Start Next.js Frontend
echo -e "${GREEN}👉 Starting Frontend (Next.js) on http://localhost:3000...${NC}"
cd "$ROOT_DIR/apps/web" || exit 1
npm run dev &

echo -e "${BLUE}✅ Environment ready!${NC}"
echo -e "Backend: ${GREEN}http://127.0.0.1:8000${NC}"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Press ${BLUE}Ctrl+C${NC} to shut down everything safely."

# Keep the script running to maintain the traps
wait
