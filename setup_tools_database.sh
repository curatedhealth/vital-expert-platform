#!/bin/bash

# ============================================================================
# VITAL AI Platform - Tools Database Setup Script
# Date: November 2, 2025
# Purpose: Automated setup of tools registry in Supabase
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   VITAL AI Platform - Tools Database Setup              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}❌ Error: SUPABASE_DB_URL environment variable is not set${NC}"
    echo ""
    echo "Please set your Supabase connection string:"
    echo "  export SUPABASE_DB_URL='postgresql://user:pass@host:port/database'"
    echo ""
    exit 1
fi

echo -e "${YELLOW}📊 Using Supabase database:${NC}"
echo "  $(echo $SUPABASE_DB_URL | sed 's/:\/\/.*@/:\/\/***@/')"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql command not found${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

echo -e "${GREEN}✅ psql found${NC}"
echo ""

# Function to run SQL file
run_sql_file() {
    local file_path="$1"
    local description="$2"
    
    echo -e "${YELLOW}▶ $description${NC}"
    echo "  File: $(basename "$file_path")"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}  ❌ File not found: $file_path${NC}"
        return 1
    fi
    
    if psql "$SUPABASE_DB_URL" -f "$file_path" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Success${NC}"
        return 0
    else
        echo -e "${RED}  ❌ Failed${NC}"
        echo -e "${YELLOW}  Retrying with error output...${NC}"
        psql "$SUPABASE_DB_URL" -f "$file_path"
        return 1
    fi
}

# Main setup sequence
echo -e "${GREEN}🚀 Starting tools database setup...${NC}"
echo ""

# Step 1: Drop old tables (optional, comment out if not needed)
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Clean up old tables (if exist)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ -f "$BASE_DIR/drop_old_tools.sql" ]; then
    run_sql_file "$BASE_DIR/drop_old_tools.sql" "Dropping old tools tables" || true
else
    echo -e "${YELLOW}  ⚠ drop_old_tools.sql not found, skipping...${NC}"
fi
echo ""

# Step 2: Create tools registry schema
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Create tools registry schema${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_sql_file "$BASE_DIR/database/sql/migrations/2025/20251102_create_tools_registry.sql" "Creating tools, agent_tools, tool_executions tables"
echo ""

# Step 3: Seed all tools
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Seed all tools${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_sql_file "$BASE_DIR/database/sql/seeds/2025/20251102_seed_all_tools.sql" "Seeding 10 AI agent tools"
echo ""

# Step 4: Link tools to agents
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Link tools to agents${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_sql_file "$BASE_DIR/database/sql/seeds/2025/20251102_link_tools_to_agents.sql" "Creating 33 agent-tool links"
echo ""

# Step 5: Link AI tools to tasks
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Link AI tools to tasks${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_sql_file "$BASE_DIR/database/sql/seeds/2025/20251102_link_ai_tools_to_tasks.sql" "Creating task category templates"
echo ""

# Verification
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Verification${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}▶ Counting tools...${NC}"
TOOL_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM tools WHERE status = 'active';" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}  ✅ Tools: $TOOL_COUNT${NC}"

echo -e "${YELLOW}▶ Counting agent-tool links...${NC}"
LINK_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM agent_tools WHERE is_enabled = true;" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}  ✅ Agent-tool links: $LINK_COUNT${NC}"

echo -e "${YELLOW}▶ Counting task category templates...${NC}"
TEMPLATE_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "SELECT COUNT(*) FROM task_category_ai_tools;" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}  ✅ Task category templates: $TEMPLATE_COUNT${NC}"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Tools Database Setup Complete!                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Summary:${NC}"
echo -e "  • Tools: ${GREEN}$TOOL_COUNT${NC}"
echo -e "  • Agent-tool links: ${GREEN}$LINK_COUNT${NC}"
echo -e "  • Task category templates: ${GREEN}$TEMPLATE_COUNT${NC}"
echo ""
echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "  1. Restart the AI engine to initialize tool registry"
echo "  2. Test tools with: psql \"\$SUPABASE_DB_URL\" -c \"SELECT * FROM get_recommended_ai_tools('research', 'literature_review');\""
echo "  3. Integrate tools into Mode 3 & 4 LangGraph workflows"
echo ""

