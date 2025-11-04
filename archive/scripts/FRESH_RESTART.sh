#!/bin/bash

echo "🔥 FRESH RESTART - Killing all servers and clearing cache..."

# Kill ALL node processes
echo "Killing all Node.js processes..."
killall -9 node 2>/dev/null
sleep 2

# Kill any processes on port 3000
echo "Clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Navigate to app directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "✅ All processes killed and cache cleared"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Open your browser and follow instructions in CLEAR_BROWSER_CACHE.md"
echo "2. Run: cd \"/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup\" && PORT=3000 npm run dev"
echo "3. Visit http://localhost:3000/agents"
echo "4. You should see 'Add to Chat' buttons on agent cards!"
