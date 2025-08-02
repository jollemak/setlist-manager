#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Setlist App with ngrok tunnel...${NC}"

# Check if ngrok is configured
if ! ngrok config check > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  ngrok is not configured with an authtoken.${NC}"
    echo -e "Please run: ${GREEN}ngrok config add-authtoken YOUR_TOKEN_HERE${NC}"
    echo -e "Get your token from: ${BLUE}https://dashboard.ngrok.com/get-started/your-authtoken${NC}"
    exit 1
fi

# Start Vite dev server in background
echo -e "${GREEN}📦 Starting Vite development server...${NC}"
npm run dev &
VITE_PID=$!

# Wait a moment for Vite to start
sleep 3

# Start ngrok tunnel
echo -e "${GREEN}🌐 Creating ngrok tunnel...${NC}"
ngrok http 5174 &
NGROK_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $VITE_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM EXIT

echo -e "\n${GREEN}✅ Servers started!${NC}"
echo -e "${BLUE}📱 Your app is now accessible from any device via the ngrok URL shown above${NC}"
echo -e "${YELLOW}💡 Tip: The ngrok URL will be something like: https://xyz123.ngrok.io${NC}"
echo -e "\n${GREEN}Press Ctrl+C to stop both servers${NC}\n"

# Wait for user to stop
wait
