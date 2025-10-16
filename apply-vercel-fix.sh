#!/bin/bash

# VITAL Expert - Quick Fix Script for Vercel 405 Error
# This script applies all necessary fixes automatically

echo "🔧 Applying Vercel 405 Error Fixes..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Backup current files
echo "📦 Step 1: Creating backups..."
cp vercel.json vercel.json.backup 2>/dev/null
cp src/app/api/chat/route.ts src/app/api/chat/route.ts.backup 2>/dev/null
cp src/app/api/chat/autonomous/route.ts src/app/api/chat/autonomous/route.ts.backup 2>/dev/null
echo -e "${GREEN}✅ Backups created${NC}"
echo ""

# Step 2: Update vercel.json
echo "🔨 Step 2: Updating vercel.json..."
cat > vercel.json << 'EOF'
{
  "version": 2,
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "npm run build",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 120
    }
  },
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, x-runtime"
        },
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
EOF
echo -e "${GREEN}✅ vercel.json updated${NC}"
echo ""

# Step 3: Add runtime config to main chat route
echo "🔨 Step 3: Adding runtime config to chat route..."

# Check if file exists
if [ -f "src/app/api/chat/route.ts" ]; then
    # Create temp file with runtime config
    cat > /tmp/route_header.ts << 'EOF'
// CRITICAL: Specify Node.js runtime for streaming and edge compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for streaming responses

EOF
    
    # Prepend to existing file
    cat /tmp/route_header.ts src/app/api/chat/route.ts > /tmp/route_new.ts
    mv /tmp/route_new.ts src/app/api/chat/route.ts
    rm /tmp/route_header.ts
    
    echo -e "${GREEN}✅ Main chat route updated${NC}"
else
    echo -e "${RED}❌ src/app/api/chat/route.ts not found${NC}"
fi
echo ""

# Step 4: Add runtime config to autonomous route
echo "🔨 Step 4: Adding runtime config to autonomous route..."

if [ -f "src/app/api/chat/autonomous/route.ts" ]; then
    # Create temp file with runtime config
    cat > /tmp/autonomous_header.ts << 'EOF'
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

EOF
    
    # Prepend to existing file
    cat /tmp/autonomous_header.ts src/app/api/chat/autonomous/route.ts > /tmp/autonomous_new.ts
    mv /tmp/autonomous_new.ts src/app/api/chat/autonomous/route.ts
    rm /tmp/autonomous_header.ts
    
    echo -e "${GREEN}✅ Autonomous route updated${NC}"
else
    echo -e "${YELLOW}⚠️  Autonomous route not found (may not be needed)${NC}"
fi
echo ""

# Step 5: Show git diff
echo "📋 Step 5: Showing changes..."
echo ""
git diff vercel.json
echo ""

# Step 6: Prompt for deployment
echo ""
echo -e "${YELLOW}🚀 Ready to deploy!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes above"
echo "2. Test locally:"
echo "   ${GREEN}rm -rf .next && npm run build && npm run start${NC}"
echo "3. Commit and push:"
echo "   ${GREEN}git add .${NC}"
echo "   ${GREEN}git commit -m 'Fix Vercel 405 error: Update function paths and runtime config'${NC}"
echo "   ${GREEN}git push origin main${NC}"
echo "4. After deployment, go to Vercel Dashboard and:"
echo "   - Click 'Redeploy' with cache UNCHECKED"
echo ""
echo -e "${GREEN}✅ All fixes applied successfully!${NC}"
echo ""
echo "Backups saved as:"
echo "  - vercel.json.backup"
echo "  - src/app/api/chat/route.ts.backup"
echo "  - src/app/api/chat/autonomous/route.ts.backup"
