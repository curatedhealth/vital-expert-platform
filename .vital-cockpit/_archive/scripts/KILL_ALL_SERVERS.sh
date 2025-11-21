#!/bin/bash
echo "🔥 NUCLEAR CLEANUP"
killall -9 node npm pnpm next 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 3
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
rm -rf .next node_modules/.cache .turbo
echo "✅ Done! Now run: PORT=3000 npm run dev"
