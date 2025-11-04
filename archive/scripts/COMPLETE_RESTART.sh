#!/bin/bash
set -e

echo "🔥 COMPLETE SYSTEM RESTART"
echo "================================"
echo ""

# Step 1: Kill ALL processes
echo "Step 1: Killing ALL Node/npm/pnpm processes..."
killall -9 node npm pnpm 2>/dev/null || true
sleep 2

# Step 2: Clear port 3000
echo "Step 2: Clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Step 3: Clear ALL caches
echo "Step 3: Clearing ALL caches..."
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

echo "✅ All processes killed and caches cleared!"
echo ""
echo "📝 NOW START THE SERVER MANUALLY:"
echo ""
echo "cd \"/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup\""
echo "PORT=3000 npm run dev"
echo ""
echo "Then clear browser cache:"
echo "1. Open Console (Cmd+Option+J)"
echo "2. Run: localStorage.clear(); sessionStorage.clear();"
echo "3. Hard refresh: Cmd+Shift+R"
