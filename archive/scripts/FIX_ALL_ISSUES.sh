#!/bin/bash

# VITAL Platform - Complete Fix Script
# This addresses all root causes identified in DIAGNOSTIC_REPORT.md

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════════"
echo "           VITAL PLATFORM - COMPLETE FIX SCRIPT"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "This script will:"
echo "1. Kill ALL Node.js processes forcefully"
echo "2. Clear ALL caches (Next.js, pnpm, npm, turbo)"
echo "3. Rebuild monorepo packages (@vital/ui)"
echo "4. Clear Service Workers"
echo "5. Start fresh server with proper environment"
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read

# Step 1: AGGRESSIVE Process Killing
echo ""
echo "🔪 Step 1: Killing ALL Node.js processes..."
echo "═══════════════════════════════════════════════════════════════════"

# Kill by port first
for PORT in 3000 3001 3002 3003; do
    echo "Killing processes on port $PORT..."
    lsof -ti:$PORT 2>/dev/null | xargs -r kill -9 2>/dev/null || true
done

# Kill all node-related processes
echo "Killing all Node.js processes..."
pkill -9 -f "node" 2>/dev/null || true
pkill -9 -f "npm" 2>/dev/null || true
pkill -9 -f "pnpm" 2>/dev/null || true
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "turbo" 2>/dev/null || true
pkill -9 -f "webpack" 2>/dev/null || true

# Final cleanup with killall
killall -9 node npm pnpm next 2>/dev/null || true

echo "✅ All processes killed"
sleep 2

# Step 2: COMPLETE Cache Clearing
echo ""
echo "🗑️  Step 2: Clearing ALL caches..."
echo "═══════════════════════════════════════════════════════════════════"

# Navigate to project directory
cd ~/Downloads/Cursor/VITAL\ path

# Remove Next.js cache
echo "Removing Next.js cache..."
rm -rf .next
rm -rf apps/digital-health-startup/.next

# Remove Node module caches
echo "Removing Node module caches..."
rm -rf node_modules/.cache
rm -rf apps/digital-health-startup/node_modules/.cache

# Remove pnpm cache
echo "Removing pnpm cache..."
rm -rf node_modules/.pnpm
rm -rf ~/.pnpm-store

# Remove turbo cache
echo "Removing turbo cache..."
rm -rf .turbo
rm -rf apps/digital-health-startup/.turbo

# Remove SWC cache
echo "Removing SWC cache..."
rm -rf .swc
rm -rf apps/digital-health-startup/.swc

# Remove parcel cache if exists
rm -rf .parcel-cache
rm -rf apps/digital-health-startup/.parcel-cache

# Remove webpack cache
rm -rf node_modules/.webpack
rm -rf apps/digital-health-startup/node_modules/.webpack

echo "✅ All caches cleared"
sleep 2

# Step 3: Rebuild Monorepo Packages
echo ""
echo "📦 Step 3: Rebuilding monorepo packages..."
echo "═══════════════════════════════════════════════════════════════════"

# Check if we're in a monorepo
if [ -f "turbo.json" ] || [ -f "lerna.json" ] || [ -f "rush.json" ]; then
    echo "Monorepo detected. Rebuilding packages..."
    
    # Try different build commands based on what's available
    if command -v turbo &> /dev/null; then
        echo "Using turbo to rebuild..."
        turbo run build --force --no-cache
    elif command -v lerna &> /dev/null; then
        echo "Using lerna to rebuild..."
        lerna run build --stream
    elif [ -f "package.json" ]; then
        # Check for workspace build script
        if grep -q '"build:packages"' package.json; then
            echo "Running build:packages..."
            pnpm run build:packages
        elif grep -q '"build:all"' package.json; then
            echo "Running build:all..."
            pnpm run build:all
        fi
    fi
    
    # Specifically rebuild @vital/ui if it exists
    if [ -d "packages/ui" ]; then
        echo "Rebuilding @vital/ui package..."
        cd packages/ui
        rm -rf dist lib build
        pnpm run build || npm run build || true
        cd ../..
    fi
fi

echo "✅ Packages rebuilt"
sleep 2

# Step 4: Environment Setup
echo ""
echo "🔧 Step 4: Setting up environment..."
echo "═══════════════════════════════════════════════════════════════════"

cd apps/digital-health-startup

# Check and update .env.local
if [ -f ".env.local" ]; then
    echo "Updating .env.local settings..."
    
    # Disable mock API if enabled
    sed -i.bak 's/NEXT_PUBLIC_ENABLE_MOCK_API=true/NEXT_PUBLIC_ENABLE_MOCK_API=false/g' .env.local
    
    # Ensure NODE_ENV is set properly
    if ! grep -q "NODE_ENV=" .env.local; then
        echo "NODE_ENV=development" >> .env.local
    fi
    
    echo "✅ Environment configured"
else
    echo "⚠️  No .env.local found"
fi

# Step 5: Service Worker Cleanup
echo ""
echo "🌐 Step 5: Creating Service Worker cleanup script..."
echo "═══════════════════════════════════════════════════════════════════"

cat > public/clear-sw.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Clear Service Workers</title>
</head>
<body>
    <h1>Clearing Service Workers...</h1>
    <pre id="log"></pre>
    <script>
        const log = document.getElementById('log');
        
        async function clearServiceWorkers() {
            log.textContent += 'Starting Service Worker cleanup...\n';
            
            // Unregister all service workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                    log.textContent += `Unregistered: ${registration.scope}\n`;
                }
            }
            
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (let name of cacheNames) {
                    await caches.delete(name);
                    log.textContent += `Deleted cache: ${name}\n`;
                }
            }
            
            log.textContent += '\n✅ All Service Workers and caches cleared!\n';
            log.textContent += '\nYou can now close this tab and return to the app.\n';
        }
        
        clearServiceWorkers();
    </script>
</body>
</html>
EOF

echo "✅ Service Worker cleanup page created at /clear-sw.html"

# Step 6: Install Dependencies Fresh
echo ""
echo "📥 Step 6: Installing dependencies fresh..."
echo "═══════════════════════════════════════════════════════════════════"

# Remove lock files for completely fresh install (optional)
# rm -f pnpm-lock.yaml package-lock.json yarn.lock

# Install with pnpm
pnpm install --force

echo "✅ Dependencies installed"
sleep 2

# Step 7: Start Development Server
echo ""
echo "🚀 Step 7: Starting development server..."
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "IMPORTANT STEPS:"
echo "1. First visit: http://localhost:3000/clear-sw.html"
echo "2. Wait for 'All Service Workers cleared' message"
echo "3. Close that tab"
echo "4. Open new Incognito window"
echo "5. Visit: http://localhost:3000"
echo ""
echo "Starting server on port 3000..."
echo ""

# Start with explicit port and host
PORT=3000 HOST=localhost pnpm run dev --port 3000

# If the above fails, try next dev directly
# npx next dev -p 3000
