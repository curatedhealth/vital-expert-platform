#!/bin/bash
# =====================================================================================
# Master Seed File Execution Script
# =====================================================================================
# Loads all foundation and platform data into NEW DB (Vital-expert)
# Run this after tenants are created
# =====================================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database credentials
DB_PASSWORD="flusd9fqEb4kkTJ1"
DB_HOST="db.bomltkhixeatxuoxmolq.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"

# Base directory
BASE_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

echo -e "${BLUE}================================================================================${NC}"
echo -e "${BLUE}🚀 VITAL Platform - Master Seed Data Migration${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""
echo -e "${YELLOW}Target Database:${NC} NEW DB (Vital-expert)"
echo -e "${YELLOW}Host:${NC} ${DB_HOST}"
echo -e "${YELLOW}Timestamp:${NC} $(date)"
echo ""
echo -e "${BLUE}================================================================================${NC}"
echo ""

# Counter for tracking
TOTAL_FILES=7
CURRENT=0
FAILED=0

# Function to run a seed file
run_seed() {
    CURRENT=$((CURRENT + 1))
    local FILE=$1
    local DESCRIPTION=$2
    local EXPECTED_ROWS=$3

    echo -e "${BLUE}[${CURRENT}/${TOTAL_FILES}]${NC} ${YELLOW}${DESCRIPTION}${NC}"
    echo -e "         File: ${FILE}"
    echo -e "         Expected: ${EXPECTED_ROWS}"
    echo -n "         Status: "

    if PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" \
        -c "\set ON_ERROR_STOP on" \
        -f "${BASE_DIR}/${FILE}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# =====================================================================================
# STEP 1: Foundation Agents
# =====================================================================================
run_seed "00_foundation_agents.sql" \
    "Loading Foundation Agents" \
    "8 foundational AI agents"

# =====================================================================================
# STEP 2: Foundation Personas
# =====================================================================================
run_seed "01_foundation_personas.sql" \
    "Loading Foundation Personas" \
    "8 foundational personas"

# =====================================================================================
# STEP 3: Comprehensive Tools
# =====================================================================================
run_seed "02_COMPREHENSIVE_TOOLS_ALL.sql" \
    "Loading Comprehensive Tools Registry" \
    "~150 AI tools and function calls"

# =====================================================================================
# STEP 4: Comprehensive Prompts
# =====================================================================================
run_seed "05_COMPREHENSIVE_PROMPTS_ALL.sql" \
    "Loading Comprehensive Prompts Library" \
    "~100 prompt templates"

# =====================================================================================
# STEP 5: Comprehensive Knowledge Domains
# =====================================================================================
run_seed "06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql" \
    "Loading Knowledge Domains" \
    "~50 RAG knowledge domains"

# =====================================================================================
# STEP 6: Phase 2 Jobs to be Done
# =====================================================================================
run_seed "21_phase2_jtbds.sql" \
    "Loading Phase 2 JTBDs" \
    "127 jobs to be done"

# =====================================================================================
# STEP 7: Digital Health Jobs to be Done
# =====================================================================================
run_seed "22_digital_health_jtbds.sql" \
    "Loading Digital Health JTBDs" \
    "110 jobs to be done"

# =====================================================================================
# Final Summary
# =====================================================================================
echo ""
echo -e "${BLUE}================================================================================${NC}"
echo -e "${BLUE}📊 MIGRATION SUMMARY${NC}"
echo -e "${BLUE}================================================================================${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All ${TOTAL_FILES} seed files loaded successfully!${NC}"
    echo ""
    echo -e "Expected data loaded:"
    echo -e "  • Foundation Agents: 8"
    echo -e "  • Foundation Personas: 8"
    echo -e "  • Tools: ~150"
    echo -e "  • Prompts: ~100"
    echo -e "  • Knowledge Domains: ~50"
    echo -e "  • Jobs to be Done: 237 (127 + 110)"
    echo ""
    echo -e "${GREEN}🎉 Platform foundation is ready!${NC}"
    echo ""
    echo -e "Next steps:"
    echo -e "  1. Load Medical Affairs Personas (20_medical_affairs_personas.sql)"
    echo -e "  2. Load remaining organizational data"
    echo -e "  3. Load workflows and tasks"
    echo ""
else
    echo -e "${RED}❌ ${FAILED} seed file(s) failed to load${NC}"
    echo ""
    echo -e "Please check the error messages above and:"
    echo -e "  1. Verify tenant 'digital-health-startup' exists"
    echo -e "  2. Check database schema compatibility"
    echo -e "  3. Review failed SQL files for syntax errors"
    echo ""
    exit 1
fi

echo -e "${BLUE}================================================================================${NC}"
echo -e "${YELLOW}Timestamp:${NC} $(date)"
echo -e "${BLUE}================================================================================${NC}"
