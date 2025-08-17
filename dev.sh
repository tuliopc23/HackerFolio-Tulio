#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting HackerFolio Development Environment...${NC}"

# Function to kill processes on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down...${NC}"
    kill $API_PID $VITE_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup EXIT

# Start API
echo -e "${GREEN}Starting Go Fiber API on port 8080...${NC}"
(cd api && go run .) &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start Vite
echo -e "${GREEN}Starting Vite dev server on port 5173...${NC}"
bunx vite &
VITE_PID=$!

echo -e "${BLUE}Development servers running:${NC}"
echo "  • API:      http://localhost:8080"
echo "  • Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait