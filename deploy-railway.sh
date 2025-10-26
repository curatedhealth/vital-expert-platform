#!/bin/bash

##############################################################################
# VITAL Platform - Railway Deployment Script
# Run this script after logging in with: railway login
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path"

echo ""
echo "=========================================="
echo "🚀 VITAL Platform - Railway Deployment"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found. Please install it first:${NC}"
    echo "   npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI found${NC}"

# Check if logged in
echo -e "${BLUE}Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Railway${NC}"
    echo -e "${YELLOW}Please run: railway login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated with Railway${NC}"
echo ""

##############################################################################
# PART 1: Deploy AI Engine (Python FastAPI)
##############################################################################

echo "=========================================="
echo "📦 Part 1: Deploying AI Engine"
echo "=========================================="
echo ""

cd "$BASE_DIR/services/ai-engine"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found in services/ai-engine${NC}"
    exit 1
fi

echo -e "${BLUE}Initializing AI Engine project...${NC}"

# Check if already linked to a project
if [ -f ".railway/config.json" ]; then
    echo -e "${YELLOW}⚠️  Project already linked. Skipping initialization.${NC}"
else
    # Create new project
    echo -e "${YELLOW}Creating new Railway project: vital-ai-engine${NC}"
    railway init --name vital-ai-engine
fi

echo -e "${BLUE}Deploying AI Engine to Railway...${NC}"
railway up --detach

echo -e "${GREEN}✓ AI Engine deployed${NC}"

# Get the service URL
echo -e "${BLUE}Generating public domain...${NC}"
AI_ENGINE_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' || echo "")

if [ -z "$AI_ENGINE_URL" ]; then
    echo -e "${YELLOW}⚠️  Domain not generated yet. You may need to wait and run: railway domain${NC}"
    echo -e "${YELLOW}Please set AI_ENGINE_URL manually for the next step${NC}"
    read -p "Press enter to continue..."
else
    echo -e "${GREEN}✓ AI Engine URL: $AI_ENGINE_URL${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Don't forget to set environment variables in Railway Dashboard:${NC}"
echo "   1. Go to https://railway.app/dashboard"
echo "   2. Select 'vital-ai-engine' project"
echo "   3. Click on the service → Variables tab"
echo "   4. Add these variables:"
echo ""
echo "      OPENAI_API_KEY=<your-openai-key>"
echo "      SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
echo "      SUPABASE_SERVICE_ROLE_KEY=<your-supabase-key>"
echo "      ENVIRONMENT=production"
echo "      LOG_LEVEL=info"
echo "      MAX_TOKENS=4096"
echo "      TEMPERATURE=0.7"
echo ""
read -p "Press enter after setting variables..."

echo ""

##############################################################################
# PART 2: Deploy API Gateway (Node.js)
##############################################################################

echo "=========================================="
echo "📦 Part 2: Deploying API Gateway"
echo "=========================================="
echo ""

cd "$BASE_DIR/services/api-gateway"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found in services/api-gateway${NC}"
    exit 1
fi

echo -e "${BLUE}Initializing API Gateway project...${NC}"

# Check if already linked to a project
if [ -f ".railway/config.json" ]; then
    echo -e "${YELLOW}⚠️  Project already linked. Skipping initialization.${NC}"
else
    # Create new project
    echo -e "${YELLOW}Creating new Railway project: vital-api-gateway${NC}"
    railway init --name vital-api-gateway
fi

echo -e "${BLUE}Deploying API Gateway to Railway...${NC}"
railway up --detach

echo -e "${GREEN}✓ API Gateway deployed${NC}"

# Get the service URL
echo -e "${BLUE}Generating public domain...${NC}"
API_GATEWAY_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' || echo "")

if [ -z "$API_GATEWAY_URL" ]; then
    echo -e "${YELLOW}⚠️  Domain not generated yet. You may need to wait and run: railway domain${NC}"
    read -p "Press enter to continue..."
else
    echo -e "${GREEN}✓ API Gateway URL: $API_GATEWAY_URL${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Don't forget to set environment variables in Railway Dashboard:${NC}"
echo "   1. Go to https://railway.app/dashboard"
echo "   2. Select 'vital-api-gateway' project"
echo "   3. Click on the service → Variables tab"
echo "   4. Add these variables:"
echo ""
echo "      AI_ENGINE_URL=$AI_ENGINE_URL"
echo "      SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
echo "      SUPABASE_ANON_KEY=<your-anon-key>"
echo "      SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>"
echo "      NODE_ENV=production"
echo "      PORT=3001"
echo ""
read -p "Press enter after setting variables..."

echo ""

##############################################################################
# PART 3: Summary
##############################################################################

echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}Services deployed:${NC}"
echo "  🐍 AI Engine (Python FastAPI)"
echo "  🌐 API Gateway (Node.js Express)"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo "  AI Engine:   $AI_ENGINE_URL"
echo "  API Gateway: $API_GATEWAY_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Verify environment variables are set correctly"
echo "  2. Test services:"
echo "     curl $AI_ENGINE_URL/health"
echo "     curl $API_GATEWAY_URL/health"
echo "  3. (Optional) Add Redis cache via Railway Dashboard"
echo "  4. Deploy frontend to Vercel (see DEPLOYMENT_GUIDE.md)"
echo ""
echo -e "${GREEN}Deployment logs:${NC}"
echo "  AI Engine:   cd services/ai-engine && railway logs"
echo "  API Gateway: cd services/api-gateway && railway logs"
echo ""
echo "=========================================="
echo ""
