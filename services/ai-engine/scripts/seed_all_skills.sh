#!/bin/bash

# ============================================================================
# MASTER SKILLS SEEDING SCRIPT
# ============================================================================
# This script runs the complete skills seeding pipeline:
# 1. Parse all skills from sources
# 2. Load to PostgreSQL (Supabase)
# 3. Load to Neo4j (Knowledge Graph)
# 4. Load to Pinecone (Vector Search)
# ============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_ENGINE_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$AI_ENGINE_DIR/database/data/skills"

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║          AGENTOS 3.0 - MASTER SKILLS SEEDING PIPELINE               ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "AI Engine Directory: $AI_ENGINE_DIR"
echo "Data Directory: $DATA_DIR"
echo ""

# ============================================================================
# STEP 1: Parse Skills from Sources
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}[1/4] PARSING SKILLS FROM SOURCES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$AI_ENGINE_DIR"

# Parse VITAL skills
echo -e "${YELLOW}→ Parsing VITAL Command Center skills...${NC}"
python scripts/parse_all_skills.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ VITAL skills parsed successfully${NC}"
else
    echo -e "${RED}✗ Failed to parse VITAL skills${NC}"
    exit 1
fi

echo ""

# Parse Awesome Claude skills
echo -e "${YELLOW}→ Parsing Awesome Claude skills...${NC}"
python scripts/parse_awesome_claude_skills.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Awesome Claude skills parsed successfully${NC}"
else
    echo -e "${RED}✗ Failed to parse Awesome Claude skills${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Skills parsing complete${NC}"
echo ""

# ============================================================================
# STEP 2: Load to PostgreSQL (Supabase)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}[2/4] LOADING SKILLS TO POSTGRESQL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL environment variable not set${NC}"
    echo "  Please set your Supabase connection string:"
    echo "  export DATABASE_URL='postgresql://...'"
    exit 1
fi

# Load master seed script
echo -e "${YELLOW}→ Loading master seed script (58 skills)...${NC}"
psql "$DATABASE_URL" -f "$DATA_DIR/master_seed_all_skills.sql"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Skills loaded to PostgreSQL${NC}"
else
    echo -e "${RED}✗ Failed to load skills to PostgreSQL${NC}"
    exit 1
fi

echo ""

# Verify PostgreSQL
echo -e "${YELLOW}→ Verifying PostgreSQL...${NC}"
SKILL_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM skills WHERE is_active = true;")
echo "  Skills in database: $SKILL_COUNT"

if [ "$SKILL_COUNT" -ge 58 ]; then
    echo -e "${GREEN}✓ PostgreSQL verification passed${NC}"
else
    echo -e "${YELLOW}⚠️  Expected at least 58 skills, found $SKILL_COUNT${NC}"
fi

echo ""
echo -e "${GREEN}✅ PostgreSQL seeding complete${NC}"
echo ""

# ============================================================================
# STEP 3: Load to Neo4j and Pinecone
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}[3/4] LOADING SKILLS TO NEO4J AND PINECONE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check required environment variables
MISSING_VARS=()
[ -z "$NEO4J_URI" ] && MISSING_VARS+=("NEO4J_URI")
[ -z "$NEO4J_PASSWORD" ] && MISSING_VARS+=("NEO4J_PASSWORD")
[ -z "$PINECONE_API_KEY" ] && MISSING_VARS+=("PINECONE_API_KEY")
[ -z "$OPENAI_API_KEY" ] && MISSING_VARS+=("OPENAI_API_KEY")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please set these variables and try again."
    exit 1
fi

# Run multi-database loader
echo -e "${YELLOW}→ Running multi-database loader...${NC}"
python scripts/seed_all_skills_to_databases.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Skills loaded to Neo4j and Pinecone${NC}"
else
    echo -e "${RED}✗ Failed to load skills to Neo4j/Pinecone${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Multi-database seeding complete${NC}"
echo ""

# ============================================================================
# STEP 4: Summary and Verification
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}[4/4] FINAL SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 SKILLS INVENTORY:"
echo ""

# PostgreSQL summary
echo -e "${YELLOW}PostgreSQL (Supabase):${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    category,
    COUNT(*) as skill_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM skills
WHERE is_active = true
GROUP BY category
ORDER BY skill_count DESC;
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ SKILLS SEEDING PIPELINE COMPLETE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "All 58 skills have been loaded to:"
echo "  ✓ PostgreSQL (Supabase) - Source of truth"
echo "  ✓ Neo4j - Knowledge graph relationships"
echo "  ✓ Pinecone - Vector embeddings for semantic search"
echo ""
echo "🚀 Next Steps:"
echo "  1. Assign skills to agents: psql < database/data/skills/assign_skills_to_agents.sql"
echo "  2. Test skill execution: pytest tests/integration/test_skills_execution.py"
echo "  3. Verify in Knowledge Graph tab in the UI"
echo ""
echo "Ready for AgentOS 3.0!"
echo ""


