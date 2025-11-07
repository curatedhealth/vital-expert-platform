#!/bin/bash

# Fix Next.js Lock File Issue - Run this script to resolve the recurring issue
# Location: /Users/hichamnaim/Downloads/Cursor/VITAL path/fix-nextjs-lock.sh

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
APP_DIR="$PROJECT_ROOT/apps/digital-health-startup"

echo "🔧 Fixing Next.js Lock Issue..."
echo ""

# Step 1: Kill all Next.js processes
echo "1️⃣ Killing all Next.js and Node processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*digital-health-startup" 2>/dev/null || true
sleep 2
echo "   ✅ Processes killed"
echo ""

# Step 2: Clear ports
echo "2️⃣ Clearing ports 3000 and 3001..."
lsof -ti :3000 -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti :3001 -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo "   ✅ Ports cleared"
echo ""

# Step 3: Remove lock files and cache
echo "3️⃣ Removing lock files and cache..."
cd "$APP_DIR"
rm -f .next/dev/lock 2>/dev/null || true
rm -rf .next/cache 2>/dev/null || true
rm -rf .next/trace 2>/dev/null || true
echo "   ✅ Lock files and cache removed"
echo ""

# Step 4: Verify ports are free
echo "4️⃣ Verifying ports..."
if lsof -ti :3000 -sTCP:LISTEN 2>/dev/null; then
    echo "   ⚠️  Port 3000 still in use!"
    exit 1
else
    echo "   ✅ Port 3000 is free"
fi

if lsof -ti :3001 -sTCP:LISTEN 2>/dev/null; then
    echo "   ⚠️  Port 3001 still in use!"
    exit 1
else
    echo "   ✅ Port 3001 is free"
fi
echo ""

# Step 5: Start Next.js
echo "5️⃣ Starting Next.js dev server..."
cd "$PROJECT_ROOT"
PORT=3000 npm run dev > /tmp/frontend-dev.log 2>&1 &
NEXTJS_PID=$!
echo "   ✅ Started with PID $NEXTJS_PID"
echo ""

# Step 6: Wait and verify
echo "6️⃣ Waiting for server to start..."
sleep 8

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
    echo "   ✅ Frontend is ready at http://localhost:3000"
else
    echo "   ⏳ Still starting... Check logs at /tmp/frontend-dev.log"
fi

echo ""
echo "✅ Done! Frontend should be running on http://localhost:3000"
echo ""
echo "📝 Logs: /tmp/frontend-dev.log"
echo "🔍 To check status: curl http://localhost:3000"
echo "🛑 To stop: pkill -f 'next dev'"

