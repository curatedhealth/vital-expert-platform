#!/bin/bash

echo "🔧 Fixing 'dev' User Display Issue..."
echo ""

# Step 1: Kill all Node.js processes
echo "1️⃣ Killing all Node.js processes..."
killall -9 node 2>/dev/null
sleep 2

# Step 2: Clear port 3000
echo "2️⃣ Clearing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Step 3: Navigate to app directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Step 4: Clear Next.js cache
echo "3️⃣ Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "✅ Server cleanup complete!"
echo ""
echo "📋 NEXT STEPS (MUST DO IN THIS ORDER):"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 1: Clear Browser localStorage (CRITICAL)"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Open your browser and press: Cmd+Option+J (Mac) or F12 (Windows)"
echo "Then paste this code into the console and press Enter:"
echo ""
echo "localStorage.removeItem('vital-use-mock-auth');"
echo "localStorage.removeItem('vital-mock-user');"
echo "localStorage.removeItem('vital-mock-session');"
echo "localStorage.clear();"
echo "sessionStorage.clear();"
echo "console.log('✅ All auth storage cleared!');"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 2: Hard Refresh Browser"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Press: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)"
echo ""
echo "If still showing 'dev', also do:"
echo "- Open DevTools → Application Tab → Clear Site Data"
echo "- Restart browser completely"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 3: Start Fresh Server"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Run this command:"
echo ""
echo "cd \"/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup\" && PORT=3000 npm run dev"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "STEP 4: Login Again"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: http://localhost:3000"
echo "2. Logout if already logged in"
echo "3. Login with: hicham.naim@xroadscatalyst.com"
echo "4. You should now see your real email, NOT 'dev@vitalexpert.com'"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "💡 WHY THIS HAPPENS:"
echo ""
echo "The browser's localStorage has 'vital-use-mock-auth' set to 'true'"
echo "This forces the app into mock auth mode, showing 'dev' user."
echo "The code is correct - it's just a browser cache issue."
echo ""
echo "Once you clear localStorage and hard refresh, you'll see the real user."
echo ""
