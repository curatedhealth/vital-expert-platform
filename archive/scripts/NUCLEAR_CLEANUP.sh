#!/bin/bash

echo "=========================================="
echo "NUCLEAR CLEANUP - KILL EVERYTHING"
echo "=========================================="
echo ""

echo "Step 1: Killing all Node.js processes..."
killall -9 node 2>/dev/null
sleep 3

echo "Step 2: Killing all npm processes..."
killall -9 npm 2>/dev/null
sleep 3

echo "Step 3: Killing all Next.js dev servers by process name..."
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null
sleep 3

echo "Step 4: Force clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 3

echo "Step 5: Killing any remaining Node processes..."
ps aux | grep node | grep -v grep | grep -v "Cursor\|Stream Deck\|typings" | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 2

echo ""
echo "=========================================="
echo "VERIFICATION"
echo "=========================================="
echo ""

# Count remaining dev processes
DEV_COUNT=$(ps aux | grep -E "npm run dev|next dev" | grep -v grep | wc -l | xargs)
echo "Dev server processes remaining: $DEV_COUNT"

# Check port 3000
PORT_CHECK=$(lsof -ti:3000 2>/dev/null | wc -l | xargs)
if [ "$PORT_CHECK" -eq "0" ]; then
    echo "Port 3000: CLEAR ✅"
else
    echo "Port 3000: Still in use by $PORT_CHECK process(es)"
    lsof -ti:3000
fi

# Count all Node processes (excluding system)
NODE_COUNT=$(ps aux | grep node | grep -v grep | grep -v "Cursor\|Stream Deck\|typings" | wc -l | xargs)
echo "Node.js processes (non-system): $NODE_COUNT"

echo ""
echo "=========================================="
echo "CLEANUP COMPLETE"
echo "=========================================="
echo ""

if [ "$DEV_COUNT" -eq "0" ] && [ "$PORT_CHECK" -eq "0" ]; then
    echo "✅ SUCCESS: All dev servers killed, port 3000 clear"
    echo ""
    echo "You can now start ONE clean server:"
    echo ""
    echo "  cd \"$PWD/apps/digital-health-startup\""
    echo "  rm -rf .next"
    echo "  npm run dev"
    echo ""
else
    echo "⚠️  WARNING: Some processes may still be running"
    echo "Try running this script again, or manually kill remaining processes"
fi
