#!/bin/bash

# ============================================================================
# Ask Panel Railway Deployment Script
# ============================================================================

set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║     🚀 Ask Panel - Railway AI Engine Deployment                     ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it: npm i -g @railway/cli"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Step 2: Navigate to AI Engine
cd services/ai-engine
echo "📂 Current directory: $(pwd)"
echo ""

# Step 3: Check if frameworks.py exists
if [ ! -f "app/api/frameworks.py" ]; then
    echo -e "${RED}❌ app/api/frameworks.py not found${NC}"
    echo "Please ensure the file exists before deploying."
    exit 1
fi

echo -e "${GREEN}✅ Framework endpoints file found${NC}"
echo ""

# Step 4: Check Railway login
echo "Step 2: Checking Railway login..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Running: railway login"
    railway login
fi

echo -e "${GREEN}✅ Railway login confirmed${NC}"
echo ""

# Step 5: Check/Link Service
echo "Step 3: Checking Railway service..."
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  No Railway service linked${NC}"
    echo "Run: railway service"
    echo "Then select or create 'vital-ai-engine'"
    exit 1
fi

echo -e "${GREEN}✅ Railway service linked${NC}"
echo ""

# Step 6: Set/Verify Environment Variables
echo "Step 4: Checking environment variables..."

# Check critical variables
VARS_TO_CHECK=("OPENAI_API_KEY" "SUPABASE_URL")
MISSING_VARS=()

for VAR in "${VARS_TO_CHECK[@]}"; do
    if ! railway variables --json | grep -q "\"$VAR\""; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "   - $VAR"
    done
    echo ""
    echo "Set them with:"
    echo "  railway variables --set \"OPENAI_API_KEY=your-key\""
    echo "  railway variables --set \"SUPABASE_URL=your-url\""
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Step 7: Deploy
echo "Step 5: Deploying to Railway..."
echo -e "${BLUE}This will take 3-5 minutes...${NC}"
echo ""

railway up

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Step 8: Get URL
echo "Step 6: Getting service URL..."
RAILWAY_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' | head -1)

if [ -z "$RAILWAY_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not get URL automatically${NC}"
    echo "Run: railway domain"
else
    echo -e "${GREEN}✅ Service URL: $RAILWAY_URL${NC}"
    echo ""
    
    # Step 9: Test Health Endpoint
    echo "Step 7: Testing health endpoint..."
    sleep 5  # Wait for service to start
    
    if curl -s -f "${RAILWAY_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed (service may still be starting)${NC}"
    fi
    echo ""
    
    # Step 10: Print Next Steps
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                      ║"
    echo "║                    🎉 DEPLOYMENT SUCCESSFUL! 🎉                      ║"
    echo "║                                                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${BLUE}Your Railway AI Engine URL:${NC}"
    echo "  $RAILWAY_URL"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo ""
    echo "1. Update Frontend Environment (.env.local):"
    echo "   ${GREEN}AI_ENGINE_URL=$RAILWAY_URL${NC}"
    echo ""
    echo "2. Test Endpoints:"
    echo "   ${GREEN}curl $RAILWAY_URL/health${NC}"
    echo "   ${GREEN}curl $RAILWAY_URL/frameworks/info${NC}"
    echo ""
    echo "3. Start Frontend:"
    echo "   ${GREEN}cd apps/digital-health-startup${NC}"
    echo "   ${GREEN}pnpm dev${NC}"
    echo ""
    echo "4. Test Ask Panel:"
    echo "   ${GREEN}Open: http://localhost:3000/ask-panel${NC}"
    echo ""
    echo "5. Monitor Logs:"
    echo "   ${GREEN}railway logs --follow${NC}"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Return to root
cd ../..

