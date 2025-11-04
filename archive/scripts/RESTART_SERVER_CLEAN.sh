#!/bin/bash
# ============================================================================
# CLEAN SERVER RESTART SCRIPT
# ============================================================================
# This script forcefully kills ALL dev servers and starts ONE clean instance
# ============================================================================

echo "🧹 Cleaning up all dev servers..."

# Step 1: Kill all Node processes
echo "1️⃣ Killing all Node/npm processes..."
killall -9 node 2>/dev/null
killall -9 npm 2>/dev/null
sleep 2

# Step 2: Clear port 3000
echo "2️⃣ Clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# Step 3: Verify port is free
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "❌ Port 3000 still in use!"
    lsof -ti:3000
    exit 1
else
    echo "✅ Port 3000 is free"
fi

# Step 4: Clean cache
echo "3️⃣ Cleaning Next.js cache..."
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
rm -rf .next
echo "✅ Cache cleared"

# Step 5: Start server
echo "4️⃣ Starting dev server..."
echo "📍 URL: http://localhost:3000"
echo ""
npm run dev
