#!/bin/bash

# Restart Digital Health Startup Next.js Server

echo "🛑 Stopping Next.js server..."
kill -9 18797 18820 2>/dev/null

# Wait for processes to die
sleep 2

echo "🧹 Cleaning up any remaining processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "🚀 Starting Next.js server..."
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Start the server in the background
nohup pnpm dev > /tmp/digital-health-startup.log 2>&1 &

echo "⏳ Waiting for server to start..."
sleep 5

echo "✅ Done! Check the logs:"
echo "   tail -f /tmp/digital-health-startup.log"
echo ""
echo "🌐 Server should be running at: http://localhost:3001"
echo "🧪 Test the endpoint: http://localhost:3001/ask-expert"

