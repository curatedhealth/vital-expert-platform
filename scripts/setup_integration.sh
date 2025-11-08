#!/bin/bash
# Setup Script for Notion ↔ Supabase Integration
# This script helps you configure the integration step by step

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   VITAL Expert - Notion ↔ Supabase Integration Setup        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    
    cat > .env << 'EOF'
# ========================================
# NOTION CONFIGURATION
# ========================================
NOTION_TOKEN=
NOTION_PARENT_PAGE_ID=

# ========================================
# SUPABASE CONFIGURATION
# ========================================
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# ========================================
# SYNC CONFIGURATION
# ========================================
SYNC_INTERVAL_HOURS=6
DEBUG_LOGGING=false
AUTO_BACKUP=true
EOF
    
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  STEP 1: NOTION INTEGRATION SETUP"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to: ${BLUE}https://www.notion.so/my-integrations${NC}"
echo "2. Click '+ New integration'"
echo "3. Name: 'VITAL Supabase Sync'"
echo "4. Select your workspace"
echo "5. Click 'Submit'"
echo "6. Copy the 'Internal Integration Token'"
echo ""
echo -e "${YELLOW}The token starts with 'secret_'${NC}"
echo ""
read -p "Press Enter when you have the token..."

# Check if Python is installed
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  CHECKING DEPENDENCIES"
echo "══════════════════════════════════════════════════════════════"
echo ""

if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    echo -e "${GREEN}✓ Python found: $(python --version)${NC}"
else
    echo -e "${RED}❌ Python not found. Please install Python 3.8+${NC}"
    exit 1
fi

# Check pip
if command -v pip3 &> /dev/null; then
    PIP_CMD="pip3"
    echo -e "${GREEN}✓ pip3 found${NC}"
elif command -v pip &> /dev/null; then
    PIP_CMD="pip"
    echo -e "${GREEN}✓ pip found${NC}"
else
    echo -e "${RED}❌ pip not found. Please install pip${NC}"
    exit 1
fi

# Install required packages
echo ""
echo "Installing required Python packages..."
$PIP_CMD install --quiet python-dotenv requests supabase 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Some packages may already be installed${NC}"
}

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  STEP 2: CONFIGURE ENVIRONMENT VARIABLES"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Please edit the .env file and add:"
echo ""
echo -e "${BLUE}NOTION_TOKEN${NC}=secret_your_token_here"
echo -e "${BLUE}SUPABASE_URL${NC}=https://your-project.supabase.co"
echo -e "${BLUE}SUPABASE_SERVICE_KEY${NC}=your_service_key_here"
echo ""
echo "You can find your Supabase credentials at:"
echo "${BLUE}https://supabase.com/dashboard/project/_/settings/api${NC}"
echo ""

# Ask if user wants to edit now
read -p "Would you like to edit .env now? (y/n): " edit_env

if [[ $edit_env == "y" || $edit_env == "Y" ]]; then
    if command -v code &> /dev/null; then
        code .env
        echo "Opening .env in VS Code..."
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please edit .env manually with your preferred editor"
    fi
    
    read -p "Press Enter when you've saved your credentials..."
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  STEP 3: TEST CONNECTIONS"
echo "══════════════════════════════════════════════════════════════"
echo ""

if [ -f scripts/test_integration_connection.py ]; then
    echo "Running connection tests..."
    echo ""
    $PYTHON_CMD scripts/test_integration_connection.py
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✅ SETUP COMPLETE! You're ready to proceed.${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Next steps:"
        echo ""
        echo "1. Create Notion databases:"
        echo -e "   ${BLUE}$PYTHON_CMD scripts/create_notion_databases_from_supabase.py${NC}"
        echo ""
        echo "2. Share databases with integration (in Notion UI):"
        echo "   - Open each database"
        echo "   - Click '...' → 'Add connections'"
        echo "   - Select 'VITAL Supabase Sync'"
        echo ""
        echo "3. Populate Notion from Supabase:"
        echo -e "   ${BLUE}$PYTHON_CMD scripts/sync_bidirectional.py to-notion${NC}"
        echo ""
        echo "📖 For more info, see: QUICK_REFERENCE.md"
        echo ""
    else
        echo ""
        echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${RED}  ⚠️  SETUP INCOMPLETE - Please fix the errors above${NC}"
        echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Common issues:"
        echo ""
        echo "1. Missing NOTION_TOKEN in .env"
        echo "   → Add your integration token from https://www.notion.so/my-integrations"
        echo ""
        echo "2. Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
        echo "   → Get these from Supabase Dashboard → Settings → API"
        echo ""
        echo "3. Invalid credentials"
        echo "   → Double-check your tokens are correct"
        echo ""
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Test script not found, skipping tests${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  Setup Complete! 🎉                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"

