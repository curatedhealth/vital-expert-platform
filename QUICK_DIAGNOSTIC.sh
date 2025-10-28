#!/bin/bash

# QUICK DIAGNOSTIC - Run this FIRST to identify the issue

echo "═══════════════════════════════════════════════════════════════════"
echo "              VITAL QUICK DIAGNOSTIC"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

cd ~/Downloads/Cursor/VITAL\ path/apps/digital-health-startup

# 1. Check current processes
echo "1️⃣ PROCESS CHECK"
echo "─────────────────────────────────────"
PROCESSES=$(ps aux | grep -E "next dev|node.*dev" | grep -v grep)
if [ -n "$PROCESSES" ]; then
    echo "⚠️  Development servers running:"
    echo "$PROCESSES" | awk '{print "  PID:", $2, "Port:", $12}'
    echo ""
    echo "Multiple servers detected! This is likely the issue."
    ISSUE="MULTIPLE_SERVERS"
else
    echo "✅ No extra servers running"
fi
echo ""

# 2. Check ports
echo "2️⃣ PORT CHECK"
echo "─────────────────────────────────────"
for PORT in 3000 3001 3002; do
    RESULT=$(lsof -i:$PORT 2>/dev/null)
    if [ -n "$RESULT" ]; then
        echo "Port $PORT: IN USE"
        echo "$RESULT" | tail -1
    else
        echo "Port $PORT: FREE"
    fi
done
echo ""

# 3. Check component imports
echo "3️⃣ IMPORT CHECK"
echo "─────────────────────────────────────"
PACKAGE_IMPORTS=$(grep -r "from '@vital/ui" src/ 2>/dev/null | wc -l)
LOCAL_IMPORTS=$(grep -r "from '@/components/ui/enhanced-agent-card" src/ 2>/dev/null | wc -l)

if [ $PACKAGE_IMPORTS -gt 0 ]; then
    echo "❌ Found $PACKAGE_IMPORTS imports from @vital/ui package"
    echo "   These are loading OLD versions!"
    ISSUE="PACKAGE_IMPORTS"
else
    echo "✅ No package imports found"
fi

if [ $LOCAL_IMPORTS -gt 0 ]; then
    echo "✅ Found $LOCAL_IMPORTS local component imports (good)"
else
    echo "⚠️  No local imports found"
fi
echo ""

# 4. Check if component has button
echo "4️⃣ COMPONENT CODE CHECK"
echo "─────────────────────────────────────"
if [ -f "src/components/ui/enhanced-agent-card.tsx" ]; then
    BUTTON_EXISTS=$(grep -c "Add to Chat" src/components/ui/enhanced-agent-card.tsx)
    if [ $BUTTON_EXISTS -gt 0 ]; then
        echo "✅ Component HAS 'Add to Chat' button ($BUTTON_EXISTS occurrences)"
        LINE=$(grep -n "Add to Chat" src/components/ui/enhanced-agent-card.tsx | head -1 | cut -d: -f1)
        echo "   Found at line: $LINE"
    else
        echo "❌ Component MISSING 'Add to Chat' button"
        ISSUE="MISSING_BUTTON"
    fi
else
    echo "❌ Component file not found!"
    ISSUE="MISSING_FILE"
fi
echo ""

# 5. Check build output
echo "5️⃣ BUILD OUTPUT CHECK"
echo "─────────────────────────────────────"
if [ -d ".next" ]; then
    LAST_BUILD=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" .next 2>/dev/null || stat -c "%y" .next 2>/dev/null | cut -d' ' -f1-2)
    echo "Last build: $LAST_BUILD"
    
    # Check if build is stale
    COMPONENT_TIME=$(stat -f "%Sm" -t "%s" src/components/ui/enhanced-agent-card.tsx 2>/dev/null || stat -c "%Y" src/components/ui/enhanced-agent-card.tsx 2>/dev/null)
    BUILD_TIME=$(stat -f "%Sm" -t "%s" .next 2>/dev/null || stat -c "%Y" .next 2>/dev/null)
    
    if [ -n "$COMPONENT_TIME" ] && [ -n "$BUILD_TIME" ]; then
        if [ "$COMPONENT_TIME" -gt "$BUILD_TIME" ]; then
            echo "⚠️  Component modified AFTER last build - rebuild needed!"
            ISSUE="STALE_BUILD"
        else
            echo "✅ Build is up to date"
        fi
    fi
else
    echo "⚠️  No .next directory - needs build"
fi
echo ""

# 6. Check environment
echo "6️⃣ ENVIRONMENT CHECK"
echo "─────────────────────────────────────"
if [ -f ".env.local" ]; then
    MOCK_API=$(grep "NEXT_PUBLIC_ENABLE_MOCK_API=true" .env.local)
    if [ -n "$MOCK_API" ]; then
        echo "⚠️  Mock API is ENABLED - this might cause auth issues"
        ISSUE="MOCK_API"
    else
        echo "✅ Mock API disabled"
    fi
else
    echo "⚠️  No .env.local file"
fi
echo ""

# 7. Check monorepo structure
echo "7️⃣ MONOREPO CHECK"
echo "─────────────────────────────────────"
cd ../..
if [ -d "packages" ]; then
    echo "📦 Monorepo structure detected"
    if [ -d "packages/ui" ]; then
        echo "   Found packages/ui"
        if [ -d "packages/ui/dist" ] || [ -d "packages/ui/lib" ]; then
            UI_BUILD_TIME=$(stat -f "%Sm" -t "%s" packages/ui/dist 2>/dev/null || stat -c "%Y" packages/ui/dist 2>/dev/null)
            CURRENT_TIME=$(date +%s)
            AGE=$((CURRENT_TIME - UI_BUILD_TIME))
            if [ $AGE -gt 3600 ]; then
                echo "   ⚠️  Package build is over 1 hour old"
                ISSUE="STALE_PACKAGE"
            else
                echo "   ✅ Package recently built"
            fi
        else
            echo "   ⚠️  Package not built"
            ISSUE="PACKAGE_NOT_BUILT"
        fi
    fi
else
    echo "✅ Not a monorepo"
fi
cd apps/digital-health-startup
echo ""

# DIAGNOSIS
echo "═══════════════════════════════════════════════════════════════════"
echo "              DIAGNOSIS & SOLUTION"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

case "$ISSUE" in
    "MULTIPLE_SERVERS")
        echo "🔴 PROBLEM: Multiple dev servers running"
        echo ""
        echo "🔧 SOLUTION:"
        echo "1. Kill all servers:"
        echo "   pkill -9 -f 'next dev'"
        echo "2. Clear port:"
        echo "   lsof -ti:3000 | xargs kill -9"
        echo "3. Start fresh:"
        echo "   pnpm run dev"
        ;;
        
    "PACKAGE_IMPORTS")
        echo "🔴 PROBLEM: Components imported from @vital/ui package"
        echo ""
        echo "🔧 SOLUTION:"
        echo "1. Fix imports:"
        echo "   find src/ -type f -name '*.tsx' -exec sed -i '' \"s|from '@vital/ui'|from '@/components/ui'|g\" {} \;"
        echo "2. Restart server"
        ;;
        
    "MISSING_BUTTON")
        echo "🔴 PROBLEM: Button code not in component"
        echo ""
        echo "🔧 SOLUTION:"
        echo "The button code needs to be added to the component."
        echo "Check git status - the changes might not be committed."
        ;;
        
    "STALE_BUILD")
        echo "🔴 PROBLEM: Build is older than component changes"
        echo ""
        echo "🔧 SOLUTION:"
        echo "1. Clear cache:"
        echo "   rm -rf .next"
        echo "2. Restart:"
        echo "   pnpm run dev"
        ;;
        
    "MOCK_API")
        echo "🔴 PROBLEM: Mock API enabled"
        echo ""
        echo "🔧 SOLUTION:"
        echo "1. Edit .env.local:"
        echo "   NEXT_PUBLIC_ENABLE_MOCK_API=false"
        echo "2. Restart server"
        ;;
        
    "STALE_PACKAGE"|"PACKAGE_NOT_BUILT")
        echo "🔴 PROBLEM: Monorepo package needs rebuilding"
        echo ""
        echo "🔧 SOLUTION:"
        echo "1. Rebuild packages:"
        echo "   cd ../.. && pnpm run build:packages"
        echo "2. Return and restart:"
        echo "   cd apps/digital-health-startup && pnpm run dev"
        ;;
        
    *)
        echo "✅ No obvious issues detected!"
        echo ""
        echo "Try these steps:"
        echo "1. Hard refresh browser: Cmd+Shift+R"
        echo "2. Open incognito window"
        echo "3. Clear service workers at: /clear-sw.html"
        ;;
esac

echo ""
echo "Run this diagnostic after trying the solution to verify fix."
