#!/bin/bash

# ============================================================================
# ASK PANEL - LOCAL DEVELOPMENT SETUP SCRIPT
# ============================================================================
# This script creates symlinks from .env.vercel to the services that need it
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ASK PANEL - LOCAL DEVELOPMENT SETUP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.vercel exists
if [ ! -f "$PROJECT_ROOT/.env.vercel" ]; then
    echo -e "${RED}❌ Error: .env.vercel not found in project root${NC}"
    echo -e "${YELLOW}   Please ensure .env.vercel exists with all required credentials${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found .env.vercel${NC}"
echo ""

# ============================================================================
# BACKEND (ai-engine) SETUP
# ============================================================================

echo -e "${BLUE}📦 Setting up Backend (ai-engine)...${NC}"

BACKEND_DIR="$PROJECT_ROOT/services/ai-engine"
BACKEND_ENV="$BACKEND_DIR/.env.local"

if [ -L "$BACKEND_ENV" ]; then
    echo -e "${YELLOW}⚠️  Symlink already exists: $BACKEND_ENV${NC}"
    echo -e "${YELLOW}   Removing old symlink...${NC}"
    rm "$BACKEND_ENV"
elif [ -f "$BACKEND_ENV" ]; then
    echo -e "${YELLOW}⚠️  File already exists: $BACKEND_ENV${NC}"
    echo -e "${YELLOW}   Backing up to .env.local.backup...${NC}"
    mv "$BACKEND_ENV" "$BACKEND_ENV.backup"
fi

# Create symlink
cd "$BACKEND_DIR"
ln -sf ../../.env.vercel .env.local
echo -e "${GREEN}✅ Created symlink: services/ai-engine/.env.local -> .env.vercel${NC}"

# Verify
if [ -L .env.local ]; then
    echo -e "${GREEN}✅ Verified: Symlink is working${NC}"
else
    echo -e "${RED}❌ Error: Failed to create symlink${NC}"
    exit 1
fi

echo ""

# ============================================================================
# FRONTEND (digital-health-startup) SETUP
# ============================================================================

echo -e "${BLUE}🎨 Setting up Frontend (digital-health-startup)...${NC}"

FRONTEND_DIR="$PROJECT_ROOT/apps/digital-health-startup"
FRONTEND_ENV="$FRONTEND_DIR/.env.local"

# Check if .env.local already exists
if [ -f "$FRONTEND_ENV" ] && [ ! -L "$FRONTEND_ENV" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists (not a symlink)${NC}"
    echo -e "${YELLOW}   Checking for NEXT_PUBLIC_AI_ENGINE_URL...${NC}"
    
    if grep -q "NEXT_PUBLIC_AI_ENGINE_URL" "$FRONTEND_ENV"; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_AI_ENGINE_URL already configured${NC}"
    else
        echo -e "${YELLOW}   Adding NEXT_PUBLIC_AI_ENGINE_URL...${NC}"
        echo "" >> "$FRONTEND_ENV"
        echo "# Ask Panel Local Development" >> "$FRONTEND_ENV"
        echo "NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000" >> "$FRONTEND_ENV"
        echo -e "${GREEN}✅ Added NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000${NC}"
    fi
elif [ -L "$FRONTEND_ENV" ]; then
    echo -e "${GREEN}✅ Symlink already exists: $FRONTEND_ENV${NC}"
else
    # Create symlink
    cd "$FRONTEND_DIR"
    ln -sf ../../.env.vercel .env.local
    echo -e "${GREEN}✅ Created symlink: apps/digital-health-startup/.env.local -> .env.vercel${NC}"
    
    # Add NEXT_PUBLIC_AI_ENGINE_URL to .env.vercel or create override
    echo -e "${YELLOW}⚠️  Note: You may need to add NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000 to .env.vercel${NC}"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Environment Configuration:${NC}"
echo -e "   Backend:  services/ai-engine/.env.local → .env.vercel"
echo -e "   Frontend: apps/digital-health-startup/.env.local"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Start Backend:${NC}"
echo -e "   cd services/ai-engine"
echo -e "   source venv/bin/activate"
echo -e "   uvicorn src.main:app --reload --port 8000"
echo ""
echo -e "${YELLOW}Terminal 2 - Start Frontend:${NC}"
echo -e "   cd apps/digital-health-startup"
echo -e "   pnpm dev"
echo ""
echo -e "${YELLOW}Browser:${NC}"
echo -e "   http://localhost:8000/docs    (Backend API)"
echo -e "   http://localhost:3002/ask-panel  (Frontend)"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""

