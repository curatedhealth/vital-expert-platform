#!/bin/bash

echo "=========================================="
echo "VITAL Platform - Complete Server Cleanup"
echo "=========================================="
echo ""

# Kill all Node and npm processes
echo "1. Killing all Node.js processes..."
killall -9 node 2>/dev/null
sleep 1

echo "2. Killing all npm processes..."
killall -9 npm 2>/dev/null
sleep 1

# Clear port 3000
echo "3. Clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Clear port 3001 (fallback port)
echo "4. Clearing port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1

# Verify cleanup
echo "5. Verifying cleanup..."
NODE_PROCESSES=$(ps aux | grep -E "node|npm" | grep -v grep | wc -l)
if [ $NODE_PROCESSES -eq 0 ]; then
    echo "   ✅ All Node/npm processes killed successfully"
else
    echo "   ⚠️  Warning: $NODE_PROCESSES Node/npm processes still running"
    ps aux | grep -E "node|npm" | grep -v grep
fi

# Navigate to project directory
echo ""
echo "6. Navigating to project directory..."
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Clear Next.js cache
echo "7. Clearing Next.js cache..."
rm -rf .next
echo "   ✅ Cache cleared"

echo ""
echo "=========================================="
echo "Cleanup complete! Now starting dev server..."
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop the server when done"
echo ""

# Start ONE clean dev server
npm run dev
