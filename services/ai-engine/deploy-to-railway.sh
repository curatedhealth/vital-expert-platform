#!/bin/bash
# =============================================
# VITAL AI Engine - Railway Deployment Script
# =============================================
# 
# This script automates the Railway deployment process
# using your existing .env.vercel credentials.
#
# Prerequisites:
# - Railway CLI installed (npm install -g @railway/cli)
# - Railway account (railway login)
# - .env.vercel file with Supabase credentials
#
# =============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚂 VITAL AI Engine - Railway Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# =============================================
# Step 1: Check prerequisites
# =============================================

echo "📋 Step 1: Checking prerequisites..."
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g @railway/cli"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Railway CLI installed${NC}"

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo ""
    echo "Logging in..."
    railway login
    echo ""
fi
echo -e "${GREEN}✅ Railway authenticated${NC}"

# Navigate to ai-engine directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo -e "${GREEN}✅ In ai-engine directory${NC}"
echo ""

# =============================================
# Step 2: Load environment variables
# =============================================

echo "📦 Step 2: Loading environment variables..."
echo ""

# Load from .env.vercel (2 levels up from services/ai-engine)
ENV_FILE="$SCRIPT_DIR/../../.env.vercel"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    echo -e "${GREEN}✅ Loaded credentials from .env.vercel${NC}"
    echo "   Location: $ENV_FILE"
else
    echo -e "${RED}❌ .env.vercel not found at: $ENV_FILE${NC}"
    echo ""
    echo "Please ensure .env.vercel exists in the project root."
    exit 1
fi

# Construct DATABASE_URL
DATABASE_URL="postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres"

# Verify required variables
if [ -z "$OPENAI_API_KEY" ] || [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing required environment variables${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required variables loaded${NC}"
echo ""

# =============================================
# Step 3: Link or create Railway project
# =============================================

echo "🔗 Step 3: Railway project setup..."
echo ""

# Check if already linked
if [ ! -f ".railway" ]; then
    echo -e "${YELLOW}⚠️  Not linked to a Railway project${NC}"
    echo ""
    echo "Choose an option:"
    echo "  1. Link to existing project (railway link)"
    echo "  2. Create new project (railway init)"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    if [ "$choice" == "1" ]; then
        railway link
    elif [ "$choice" == "2" ]; then
        railway init
    else
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
    fi
    echo ""
fi

echo -e "${GREEN}✅ Railway project linked${NC}"
echo ""

# =============================================
# Step 4: Set environment variables
# =============================================

echo "🔐 Step 4: Setting environment variables on Railway..."
echo ""

# Set all required variables (using new Railway CLI syntax)
echo "Setting required variables..."
railway variables --set "OPENAI_API_KEY=$OPENAI_API_KEY" \
                  --set "SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" \
                  --set "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
                  --set "DATABASE_URL=$DATABASE_URL" \
                  --set "ENV=production" \
                  --set "PLATFORM_TENANT_ID=550e8400-e29b-41d4-a716-446655440000" \
                  --set "LOG_LEVEL=info" \
                  --set "PYTHONUNBUFFERED=1"

# Optional: Set CORS_ORIGINS (update this with your frontend URL)
echo ""
echo -e "${YELLOW}⚠️  CORS Configuration${NC}"
echo "Please enter your frontend URL(s) for CORS (comma-separated)"
echo "Example: https://your-app.vercel.app,https://your-custom-domain.com"
echo ""
read -p "Frontend URL(s): " cors_origins

if [ -n "$cors_origins" ]; then
    railway variables --set "CORS_ORIGINS=$cors_origins"
    echo -e "${GREEN}✅ CORS_ORIGINS set${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping CORS_ORIGINS (will use default: *)${NC}"
fi

echo ""
echo -e "${GREEN}✅ All environment variables set on Railway${NC}"
echo ""

# =============================================
# Step 5: Deploy
# =============================================

echo "🚀 Step 5: Deploying to Railway..."
echo ""

railway up

echo ""
echo -e "${GREEN}✅ Deployment initiated${NC}"
echo ""

# =============================================
# Step 6: Post-deployment verification
# =============================================

echo "🔍 Step 6: Post-deployment verification..."
echo ""

# Wait a moment for deployment to start
sleep 5

# Get Railway URL
echo "📍 Getting Railway URL..."
RAILWAY_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' || echo "")

if [ -n "$RAILWAY_URL" ]; then
    echo -e "${GREEN}✅ Service URL: $RAILWAY_URL${NC}"
    echo ""
    
    # Wait for service to be ready
    echo "⏳ Waiting for service to be ready (30 seconds)..."
    sleep 30
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    if curl -s "${RAILWAY_URL}/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check pending (may take a few more seconds)${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  Railway URL not available yet${NC}"
    echo "Run 'railway domain' to get your URL once deployment completes"
    echo ""
fi

# Show logs
echo "📋 Recent logs:"
railway logs --tail 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Next Steps:"
echo ""
echo "1. View logs:"
echo "   railway logs --follow"
echo ""
echo "2. Get service URL:"
echo "   railway domain"
echo ""
echo "3. Test API:"
if [ -n "$RAILWAY_URL" ]; then
    echo "   curl ${RAILWAY_URL}/health"
else
    echo "   curl https://your-service.railway.app/health"
fi
echo ""
echo "4. Open dashboard:"
echo "   railway open"
echo ""
echo "5. Monitor deployment:"
echo "   railway status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

