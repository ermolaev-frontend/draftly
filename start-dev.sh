#!/bin/bash

# Script to start both frontend and backend development servers
# Usage: ./start-dev.sh

echo "🚀 Starting Draftly development servers..."

# Function to cleanup background processes on script exit
cleanup() {
    echo "🛑 Stopping all development servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
pnpm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are starting up..."
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔌 Backend WebSocket server will be available at: ws://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID 