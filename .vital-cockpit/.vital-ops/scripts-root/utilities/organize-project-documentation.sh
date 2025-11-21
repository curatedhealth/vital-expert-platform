#!/bin/bash

# VITAL Platform - Project Documentation Organization Script
# This script organizes markdown files, SQL seeds, and scripts into the .claude/ structure
# Run with: bash scripts/utilities/organize-project-documentation.sh

set -e

echo "🧹 Starting VITAL Platform Documentation Organization..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directories
CLAUDE_DIR=".claude/vital-expert-docs"
ARCHIVE_DIR="docs/archive"
COMPLETION_ARCHIVE="$ARCHIVE_DIR/completion-reports"
MIGRATION_ARCHIVE="$ARCHIVE_DIR/migration-reports"
STATUS_ARCHIVE="$ARCHIVE_DIR/status-updates"
FIX_ARCHIVE="$ARCHIVE_DIR/fix-reports"
MISC_ARCHIVE="$ARCHIVE_DIR/misc"

# Create archive directories if they don't exist
mkdir -p "$COMPLETION_ARCHIVE"
mkdir -p "$MIGRATION_ARCHIVE"
mkdir -p "$STATUS_ARCHIVE"
mkdir -p "$FIX_ARCHIVE"
mkdir -p "$MISC_ARCHIVE"

# Counter for moved files
moved_count=0

echo -e "${BLUE}📁 Phase 1: Organizing Markdown Files${NC}"
echo ""

# Function to move file with logging
move_file() {
    local src="$1"
    local dest="$2"
    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$dest")"
        mv "$src" "$dest"
        echo -e "${GREEN}✓${NC} Moved: $(basename "$src") → $dest"
        ((moved_count++))
    fi
}

# ============================================================================
# AGENT-RELATED FILES → .claude/vital-expert-docs/08-agents/
# ============================================================================
echo -e "${YELLOW}Moving Agent-related documentation...${NC}"

move_file "AGENTS_IMPORT_SUCCESS.md" "$COMPLETION_ARCHIVE/AGENTS_IMPORT_SUCCESS.md"
move_file "AGENTS_SECTION_ANALYSIS.md" "$CLAUDE_DIR/08-agents/AGENTS_SECTION_ANALYSIS.md"
move_file "AGENT_ARCHITECTURE_CRITICAL_ANALYSIS.md" "$CLAUDE_DIR/08-agents/AGENT_ARCHITECTURE_CRITICAL_ANALYSIS.md"
move_file "AGENT_AVATAR_CONSISTENCY.md" "$CLAUDE_DIR/08-agents/AGENT_AVATAR_CONSISTENCY.md"
move_file "AGENT_AVATAR_DATABASE_FIX.md" "$FIX_ARCHIVE/AGENT_AVATAR_DATABASE_FIX.md"
move_file "AGENT_CAPABILITIES_ANALYSIS_GUIDE.md" "$CLAUDE_DIR/08-agents/AGENT_CAPABILITIES_ANALYSIS_GUIDE.md"
move_file "AGENT_CARDS_MINIMAL_DESIGN.md" "$CLAUDE_DIR/08-agents/AGENT_CARDS_MINIMAL_DESIGN.md"
move_file "AGENT_CREATOR_ANALYSIS_COMPLETE.md" "$COMPLETION_ARCHIVE/AGENT_CREATOR_ANALYSIS_COMPLETE.md"
move_file "AGENT_ENHANCEMENT_STATUS.md" "$STATUS_ARCHIVE/AGENT_ENHANCEMENT_STATUS.md"
move_file "AGENT_FUTURE_PROOF_SCHEMA_DESIGN.md" "$CLAUDE_DIR/08-agents/AGENT_FUTURE_PROOF_SCHEMA_DESIGN.md"
move_file "AGENT_LIBRARY_AUDIT_REPORT.md" "$CLAUDE_DIR/08-agents/AGENT_LIBRARY_AUDIT_REPORT.md"
move_file "AGENT_LIST_AVATAR_ENHANCEMENT.md" "$CLAUDE_DIR/08-agents/AGENT_LIST_AVATAR_ENHANCEMENT.md"
move_file "AGENT_ORGANIZATIONAL_MAPPING_REPORT.md" "$CLAUDE_DIR/08-agents/AGENT_ORGANIZATIONAL_MAPPING_REPORT.md"
move_file "AGENT_PROMPT_STARTERS_INTEGRATION_COMPLETE.md" "$COMPLETION_ARCHIVE/AGENT_PROMPT_STARTERS_INTEGRATION_COMPLETE.md"
move_file "AGENT_PROMPT_STARTERS_INTEGRATION_COMPLETE_FINAL.md" "$COMPLETION_ARCHIVE/AGENT_PROMPT_STARTERS_INTEGRATION_COMPLETE_FINAL.md"
move_file "AGENT_RECLASSIFICATION_REPORT.md" "$CLAUDE_DIR/08-agents/AGENT_RECLASSIFICATION_REPORT.md"
move_file "AGENT_SCHEMA_NORMALIZATION_ANALYSIS.md" "$CLAUDE_DIR/08-agents/AGENT_SCHEMA_NORMALIZATION_ANALYSIS.md"

# ============================================================================
# DATABASE & SCHEMA FILES → .claude/vital-expert-docs/05-architecture/data/
# ============================================================================
echo -e "${YELLOW}Moving Database & Schema documentation...${NC}"

move_file "DATABASE_MIGRATION_GUIDE.md" "$CLAUDE_DIR/07-implementation/DATABASE_MIGRATION_GUIDE.md"
move_file "DATABASE_MIGRATION_SUMMARY.md" "$MIGRATION_ARCHIVE/DATABASE_MIGRATION_SUMMARY.md"
move_file "DATABASE_SCHEMA_GOLD_STANDARD.md" "$CLAUDE_DIR/05-architecture/data/DATABASE_SCHEMA_GOLD_STANDARD.md"
move_file "DATA_GAP_ASSESSMENT_REPORT.md" "$CLAUDE_DIR/05-architecture/data/DATA_GAP_ASSESSMENT_REPORT.md"
move_file "DATA_SEEDING_GUIDE.md" "$CLAUDE_DIR/07-implementation/DATA_SEEDING_GUIDE.md"
move_file "ORGANIZATIONAL_DATA_GAP_ANALYSIS.md" "$CLAUDE_DIR/05-architecture/data/ORGANIZATIONAL_DATA_GAP_ANALYSIS.md"

# ============================================================================
# API & BACKEND FILES → .claude/vital-expert-docs/09-api/
# ============================================================================
echo -e "${YELLOW}Moving API & Backend documentation...${NC}"

move_file "API_DOCUMENTATION.md" "$CLAUDE_DIR/09-api/api-reference/API_DOCUMENTATION.md"
move_file "API_TESTING_RESULTS.md" "$CLAUDE_DIR/11-testing/API_TESTING_RESULTS.md"
move_file "BACKEND_API_IMPLEMENTATION_SUMMARY.md" "$CLAUDE_DIR/09-api/BACKEND_API_IMPLEMENTATION_SUMMARY.md"
move_file "BACKEND_SENTRY_FIX.md" "$FIX_ARCHIVE/BACKEND_SENTRY_FIX.md"
move_file "BACKEND_SENTRY_MONITORING.md" "$CLAUDE_DIR/12-operations/monitoring/BACKEND_SENTRY_MONITORING.md"
move_file "BACKEND_STATUS_CHECK.md" "$STATUS_ARCHIVE/BACKEND_STATUS_CHECK.md"

# ============================================================================
# FRONTEND & UI FILES → .claude/vital-expert-docs/05-architecture/frontend/
# ============================================================================
echo -e "${YELLOW}Moving Frontend & UI documentation...${NC}"

move_file "COMPREHENSIVE_FRONTEND_AUDIT.md" "$CLAUDE_DIR/05-architecture/frontend/COMPREHENSIVE_FRONTEND_AUDIT.md"
move_file "FRONTEND_INTEGRATION_FINAL_STATUS.md" "$COMPLETION_ARCHIVE/FRONTEND_INTEGRATION_FINAL_STATUS.md"
move_file "FRONTEND_INTEGRATION_GUIDE.md" "$CLAUDE_DIR/07-implementation/FRONTEND_INTEGRATION_GUIDE.md"
move_file "COMPONENT_REFACTORING_PLAYBOOK.md" "$CLAUDE_DIR/05-architecture/frontend/COMPONENT_REFACTORING_PLAYBOOK.md"

# ============================================================================
# ASK PANEL/EXPERT/COMMITTEE → .claude/vital-expert-docs/04-services/
# ============================================================================
echo -e "${YELLOW}Moving Service documentation (Ask Panel/Expert/Committee)...${NC}"

move_file "ASK_EXPERT_AUDIT.md" "$CLAUDE_DIR/04-services/ask-expert/ASK_EXPERT_AUDIT.md"
move_file "ASK_EXPERT_COMPREHENSIVE_AUDIT.md" "$CLAUDE_DIR/04-services/ask-expert/ASK_EXPERT_COMPREHENSIVE_AUDIT.md"
move_file "ASK_EXPERT_HEADER_STANDARDIZATION.md" "$CLAUDE_DIR/04-services/ask-expert/ASK_EXPERT_HEADER_STANDARDIZATION.md"
move_file "ASK_PANEL_CUSTOMIZE_RUN_COMPLETE.md" "$COMPLETION_ARCHIVE/ASK_PANEL_CUSTOMIZE_RUN_COMPLETE.md"
move_file "ASK_PANEL_ENHANCED_FEATURES_COMPLETE.md" "$COMPLETION_ARCHIVE/ASK_PANEL_ENHANCED_FEATURES_COMPLETE.md"
move_file "ASK_PANEL_TOOLS_DESIGN_COMPLETE.md" "$COMPLETION_ARCHIVE/ASK_PANEL_TOOLS_DESIGN_COMPLETE.md"

# ============================================================================
# WORKFLOWS → .claude/vital-expert-docs/06-workflows/
# ============================================================================
echo -e "${YELLOW}Moving Workflow documentation...${NC}"

move_file "HIERARCHICAL_NAVIGATION_GUIDE.md" "$CLAUDE_DIR/06-workflows/HIERARCHICAL_NAVIGATION_GUIDE.md"
move_file "HIERARCHICAL_WORKFLOWS_COMPARISON.md" "$CLAUDE_DIR/06-workflows/HIERARCHICAL_WORKFLOWS_COMPARISON.md"
move_file "HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md" "$COMPLETION_ARCHIVE/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md"
move_file "HIERARCHICAL_WORKFLOWS_README.md" "$CLAUDE_DIR/06-workflows/HIERARCHICAL_WORKFLOWS_README.md"
move_file "HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md" "$CLAUDE_DIR/06-workflows/HIERARCHICAL_WORKFLOW_FLOW_INTEGRATION_GUIDE.md"
move_file "HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md" "$COMPLETION_ARCHIVE/HIERARCHICAL_WORKFLOW_IMPLEMENTATION_SUMMARY.md"
move_file "HIERARCHICAL_WORKFLOW_QUICKSTART.md" "$CLAUDE_DIR/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md"
move_file "DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md" "$CLAUDE_DIR/06-workflows/DIGITAL_HEALTH_HIERARCHICAL_WORKFLOWS.md"

# ============================================================================
# PERSONA FILES → .claude/vital-expert-docs/10-knowledge-assets/personas/
# ============================================================================
echo -e "${YELLOW}Moving Persona documentation...${NC}"

move_file "PERSONA_SEEDING_COMPLETE_GUIDE.md" "$CLAUDE_DIR/10-knowledge-assets/personas/PERSONA_SEEDING_COMPLETE_GUIDE.md"
move_file "PHARMA_IMPORT_COMPLETE_SUMMARY.md" "$COMPLETION_ARCHIVE/PHARMA_IMPORT_COMPLETE_SUMMARY.md"
move_file "PHARMA_IMPORT_GUIDE.md" "$CLAUDE_DIR/07-implementation/data-import/PHARMA_IMPORT_GUIDE.md"

# ============================================================================
# DEPLOYMENT & IMPLEMENTATION → .claude/vital-expert-docs/07-implementation/
# ============================================================================
echo -e "${YELLOW}Moving Deployment & Implementation documentation...${NC}"

move_file "COMPLETE_DEPLOYMENT_GUIDE.md" "$CLAUDE_DIR/07-implementation/deployment-guides/COMPLETE_DEPLOYMENT_GUIDE.md"
move_file "DEPLOYMENT_NOTES.md" "$CLAUDE_DIR/07-implementation/deployment-guides/DEPLOYMENT_NOTES.md"
move_file "IMPLEMENTATION_PLAN_COMPARISON.md" "$CLAUDE_DIR/07-implementation/IMPLEMENTATION_PLAN_COMPARISON.md"
move_file "IMPLEMENTATION_PROGRESS_SUMMARY.md" "$STATUS_ARCHIVE/IMPLEMENTATION_PROGRESS_SUMMARY.md"
move_file "IMPLEMENTATION_SUMMARY.md" "$COMPLETION_ARCHIVE/IMPLEMENTATION_SUMMARY.md"
move_file "SUPABASE_INTEGRATION_COMPLETE.md" "$COMPLETION_ARCHIVE/SUPABASE_INTEGRATION_COMPLETE.md"

# ============================================================================
# MIGRATION FILES → docs/archive/migration-reports/
# ============================================================================
echo -e "${YELLOW}Moving Migration documentation...${NC}"

move_file "MIGRATION_CLEANUP_COMPLETE.md" "$MIGRATION_ARCHIVE/MIGRATION_CLEANUP_COMPLETE.md"
move_file "MIGRATION_DIRECTORIES_EXPLAINED.md" "$MIGRATION_ARCHIVE/MIGRATION_DIRECTORIES_EXPLAINED.md"
move_file "MIGRATION_EXECUTION_GUIDE.md" "$MIGRATION_ARCHIVE/MIGRATION_EXECUTION_GUIDE.md"
move_file "MIGRATION_STATUS.md" "$MIGRATION_ARCHIVE/MIGRATION_STATUS.md"
move_file "MIGRATION_STRUCTURE_FINAL.md" "$MIGRATION_ARCHIVE/MIGRATION_STRUCTURE_FINAL.md"
move_file "POST_MIGRATION_COMPLETE_SUMMARY.md" "$MIGRATION_ARCHIVE/POST_MIGRATION_COMPLETE_SUMMARY.md"
move_file "POST_MIGRATION_GUIDE.md" "$MIGRATION_ARCHIVE/POST_MIGRATION_GUIDE.md"
move_file "POST_MIGRATION_READY.md" "$MIGRATION_ARCHIVE/POST_MIGRATION_READY.md"

# ============================================================================
# SIDEBAR FILES → .claude/vital-expert-docs/05-architecture/frontend/
# ============================================================================
echo -e "${YELLOW}Moving Sidebar documentation...${NC}"

move_file "SIDEBAR_DESIGN_SYSTEM.md" "$CLAUDE_DIR/05-architecture/frontend/SIDEBAR_DESIGN_SYSTEM.md"
move_file "SIDEBAR_ENHANCEMENTS_COMPLETE.md" "$COMPLETION_ARCHIVE/SIDEBAR_ENHANCEMENTS_COMPLETE.md"
move_file "SIDEBAR_MIGRATION_NOTES.md" "$CLAUDE_DIR/05-architecture/frontend/SIDEBAR_MIGRATION_NOTES.md"
move_file "SIDEBAR_PERSISTENCE_GUIDE.md" "$CLAUDE_DIR/05-architecture/frontend/SIDEBAR_PERSISTENCE_GUIDE.md"
move_file "SIDEBAR_QUICK_REFERENCE.md" "$CLAUDE_DIR/05-architecture/frontend/SIDEBAR_QUICK_REFERENCE.md"
move_file "SIDEBAR_REMAINING_UPDATES.md" "$STATUS_ARCHIVE/SIDEBAR_REMAINING_UPDATES.md"
move_file "SIDEBAR_UNIFICATION_SUMMARY.md" "$COMPLETION_ARCHIVE/SIDEBAR_UNIFICATION_SUMMARY.md"
move_file "SIDEBAR_VISUAL_COMPARISON.md" "$CLAUDE_DIR/05-architecture/frontend/SIDEBAR_VISUAL_COMPARISON.md"

# ============================================================================
# SQL ORGANIZATION → docs/archive/misc/
# ============================================================================
echo -e "${YELLOW}Moving SQL organization documentation...${NC}"

move_file "SQL_ORGANIZATION_SUMMARY.md" "$MISC_ARCHIVE/SQL_ORGANIZATION_SUMMARY.md"
move_file "SQL_PROTECTION_COMPLETE.md" "$COMPLETION_ARCHIVE/SQL_PROTECTION_COMPLETE.md"

# ============================================================================
# BUILD & ERROR FIXES → docs/archive/fix-reports/
# ============================================================================
echo -e "${YELLOW}Moving Build & Error Fix documentation...${NC}"

move_file "BUILD_FIX_ARCHITECTURE_PLAN.md" "$FIX_ARCHIVE/BUILD_FIX_ARCHITECTURE_PLAN.md"
move_file "BUILD_STATUS.md" "$STATUS_ARCHIVE/BUILD_STATUS.md"
move_file "ERRORS_FIXED_LOG.md" "$FIX_ARCHIVE/ERRORS_FIXED_LOG.md"
move_file "ALL_ERRORS_FIXED.md" "$COMPLETION_ARCHIVE/ALL_ERRORS_FIXED.md"
move_file "FIXES_APPLIED.md" "$FIX_ARCHIVE/FIXES_APPLIED.md"
move_file "403_ERROR_FINAL_RESOLUTION.md" "$FIX_ARCHIVE/403_ERROR_FINAL_RESOLUTION.md"

# ============================================================================
# STATUS & COMPLETION REPORTS → docs/archive/
# ============================================================================
echo -e "${YELLOW}Moving Status & Completion reports...${NC}"

move_file "CLEANUP_COMPLETE_REPORT.md" "$COMPLETION_ARCHIVE/CLEANUP_COMPLETE_REPORT.md"
move_file "CLEANUP_VERIFICATION_CHECKLIST.md" "$COMPLETION_ARCHIVE/CLEANUP_VERIFICATION_CHECKLIST.md"
move_file "COMPLETE_HEADER_STANDARDIZATION.md" "$COMPLETION_ARCHIVE/COMPLETE_HEADER_STANDARDIZATION.md"
move_file "COMPLETE_IMPLEMENTATION_SUMMARY.md" "$COMPLETION_ARCHIVE/COMPLETE_IMPLEMENTATION_SUMMARY.md"
move_file "COMPLETE_SESSION_SUMMARY.md" "$COMPLETION_ARCHIVE/COMPLETE_SESSION_SUMMARY.md"
move_file "COMPREHENSIVE_IMPLEMENTATION_STATUS.md" "$STATUS_ARCHIVE/COMPREHENSIVE_IMPLEMENTATION_STATUS.md"
move_file "CONVERSATION_SUMMARY.md" "$MISC_ARCHIVE/CONVERSATION_SUMMARY.md"
move_file "CURRENT_STATUS.md" "$STATUS_ARCHIVE/CURRENT_STATUS.md"
move_file "FINAL_IMPLEMENTATION_REPORT.md" "$COMPLETION_ARCHIVE/FINAL_IMPLEMENTATION_REPORT.md"
move_file "FINAL_PRE_MIGRATION_SUMMARY.md" "$COMPLETION_ARCHIVE/FINAL_PRE_MIGRATION_SUMMARY.md"
move_file "FINAL_SEED_FILES_READY.md" "$COMPLETION_ARCHIVE/FINAL_SEED_FILES_READY.md"
move_file "FINAL_SUMMARY.md" "$COMPLETION_ARCHIVE/FINAL_SUMMARY.md"
move_file "HANDOFF_SUMMARY.md" "$COMPLETION_ARCHIVE/HANDOFF_SUMMARY.md"
move_file "WORK_COMPLETED_SUMMARY.md" "$COMPLETION_ARCHIVE/WORK_COMPLETED_SUMMARY.md"
move_file "SYSTEM_READY.md" "$COMPLETION_ARCHIVE/SYSTEM_READY.md"

# ============================================================================
# PROJECT ORGANIZATION → docs/archive/misc/
# ============================================================================
echo -e "${YELLOW}Moving Project Organization documentation...${NC}"

move_file "PROJECT_ORGANIZATION_COMPLETE.md" "$COMPLETION_ARCHIVE/PROJECT_ORGANIZATION_COMPLETE.md"
move_file "PROJECT_STRUCTURE_FINAL.md" "$MISC_ARCHIVE/PROJECT_STRUCTURE_FINAL.md"

# ============================================================================
# EXECUTION PLANS & GUIDES → .claude/vital-expert-docs/07-implementation/
# ============================================================================
echo -e "${YELLOW}Moving Execution Plans & Guides...${NC}"

move_file "EXECUTION_PLAN_STATUS.md" "$STATUS_ARCHIVE/EXECUTION_PLAN_STATUS.md"
move_file "IMPORT_AGENTS_NOW.md" "$CLAUDE_DIR/07-implementation/data-import/IMPORT_AGENTS_NOW.md"
move_file "SEED_AGENTS_NOW.md" "$CLAUDE_DIR/07-implementation/data-import/SEED_AGENTS_NOW.md"
move_file "SEED_DATA_EXECUTION_GUIDE.md" "$CLAUDE_DIR/07-implementation/data-import/SEED_DATA_EXECUTION_GUIDE.md"
move_file "SEED_EXECUTION_STATUS.md" "$STATUS_ARCHIVE/SEED_EXECUTION_STATUS.md"
move_file "SEED_FILES_FINAL_STATUS.md" "$STATUS_ARCHIVE/SEED_FILES_FINAL_STATUS.md"
move_file "SEED_TEMPLATES_COMPLETE.md" "$COMPLETION_ARCHIVE/SEED_TEMPLATES_COMPLETE.md"
move_file "READY_TO_EXECUTE.md" "$COMPLETION_ARCHIVE/READY_TO_EXECUTE.md"

# ============================================================================
# PROMPTS & CAPABILITIES → .claude/vital-expert-docs/10-knowledge-assets/
# ============================================================================
echo -e "${YELLOW}Moving Prompts & Capabilities documentation...${NC}"

move_file "PROMPTS_FRAMEWORK_STATUS.md" "$STATUS_ARCHIVE/PROMPTS_FRAMEWORK_STATUS.md"
move_file "PROMPTS_ORGANIZATIONAL_MAPPING.md" "$CLAUDE_DIR/10-knowledge-assets/prompts/PROMPTS_ORGANIZATIONAL_MAPPING.md"
move_file "PROMPT_ANALYSIS_GUIDE.md" "$CLAUDE_DIR/10-knowledge-assets/prompts/PROMPT_ANALYSIS_GUIDE.md"
move_file "PROMPT_STARTER_TITLES_COMPLETE.md" "$COMPLETION_ARCHIVE/PROMPT_STARTER_TITLES_COMPLETE.md"
move_file "ENHANCED_PROMPTS_LOAD_COMPLETE.md" "$COMPLETION_ARCHIVE/ENHANCED_PROMPTS_LOAD_COMPLETE.md"

# ============================================================================
# TESTING & POSTMAN → .claude/vital-expert-docs/11-testing/
# ============================================================================
echo -e "${YELLOW}Moving Testing documentation...${NC}"

move_file "POSTMAN_TESTING_GUIDE.md" "$CLAUDE_DIR/11-testing/POSTMAN_TESTING_GUIDE.md"

# ============================================================================
# MISCELLANEOUS FILES → docs/archive/misc/
# ============================================================================
echo -e "${YELLOW}Moving Miscellaneous documentation...${NC}"

move_file "ACTION_REQUIRED.md" "$MISC_ARCHIVE/ACTION_REQUIRED.md"
move_file "NEXT_STEPS.md" "$MISC_ARCHIVE/NEXT_STEPS.md"
move_file "NEXT_STEPS_AFTER_RESET_FAILURE.md" "$MISC_ARCHIVE/NEXT_STEPS_AFTER_RESET_FAILURE.md"
move_file "START_HERE.md" "$MISC_ARCHIVE/START_HERE.md"
move_file "COMMANDS_CHEATSHEET.md" "$CLAUDE_DIR/00-overview/COMMANDS_CHEATSHEET.md"
move_file "ROOT_FILE_ANALYSIS.md" "$MISC_ARCHIVE/ROOT_FILE_ANALYSIS.md"
move_file "CACHE_CLEARED_SERVER_RESTART.md" "$MISC_ARCHIVE/CACHE_CLEARED_SERVER_RESTART.md"
move_file "20_PERCENT_HEALTHCARE_ACHIEVED.md" "$MISC_ARCHIVE/20_PERCENT_HEALTHCARE_ACHIEVED.md"
move_file "A_PLUS_PLUS_COMPLETE.md" "$COMPLETION_ARCHIVE/A_PLUS_PLUS_COMPLETE.md"
move_file "A_PLUS_PLUS_FINAL_STATUS.md" "$COMPLETION_ARCHIVE/A_PLUS_PLUS_FINAL_STATUS.md"
move_file "A_PLUS_PLUS_QUICK_REFERENCE.md" "$MISC_ARCHIVE/A_PLUS_PLUS_QUICK_REFERENCE.md"
move_file "AVATAR_LIBRARY_EXPLORATION.md" "$MISC_ARCHIVE/AVATAR_LIBRARY_EXPLORATION.md"
move_file "CHAT_STORE_REFACTOR_GUIDE.md" "$MISC_ARCHIVE/CHAT_STORE_REFACTOR_GUIDE.md"
move_file "CRITICAL_GAPS_ACTION_PLAN.md" "$MISC_ARCHIVE/CRITICAL_GAPS_ACTION_PLAN.md"
move_file "CRITICAL_GAPS_IMPLEMENTATION_STATUS.md" "$STATUS_ARCHIVE/CRITICAL_GAPS_IMPLEMENTATION_STATUS.md"

# ============================================================================
# AI ENGINE / WORKFLOW FILES → services/ai-engine/docs/
# ============================================================================
echo -e "${YELLOW}Moving AI Engine documentation to services directory...${NC}"

move_file "services/ai-engine/WORKFLOW_ENHANCEMENTS_COMPLETION_SUMMARY.md" "services/ai-engine/docs/WORKFLOW_ENHANCEMENTS_COMPLETION_SUMMARY.md"
move_file "services/ai-engine/WORKFLOW_ENHANCEMENT_IMPLEMENTATION_GUIDE.md" "services/ai-engine/docs/WORKFLOW_ENHANCEMENT_IMPLEMENTATION_GUIDE.md"
move_file "services/ai-engine/WORKFLOW_GOLD_STANDARD_CROSSCHECK.md" "services/ai-engine/docs/WORKFLOW_GOLD_STANDARD_CROSSCHECK.md"
move_file "services/ai-engine/WORKFLOW_SERVICES_INTEGRATION_MAP.md" "services/ai-engine/docs/WORKFLOW_SERVICES_INTEGRATION_MAP.md"

echo ""
echo -e "${BLUE}📁 Phase 2: Organizing SQL Seed Files${NC}"
echo ""

# Move old SQL preparation files to archive
if [ -d "sql/seeds/00_PREPARATION" ]; then
    echo -e "${YELLOW}Archiving old SQL preparation files...${NC}"
    mkdir -p "sql/seeds/archive/preparation-scripts-$(date +%Y%m%d)"

    # Move obviously old/test files
    for file in sql/seeds/00_PREPARATION/*TEST*.sql sql/seeds/00_PREPARATION/*DEPLOY*.sql; do
        if [ -f "$file" ]; then
            mv "$file" "sql/seeds/archive/preparation-scripts-$(date +%Y%m%d)/"
            echo -e "${GREEN}✓${NC} Archived: $(basename "$file")"
            ((moved_count++))
        fi
    done
fi

echo ""
echo -e "${BLUE}📁 Phase 3: Organizing Scripts${NC}"
echo ""

# Consolidate archive directories
if [ -d "scripts/_archive" ] && [ -d "scripts/archive" ]; then
    echo -e "${YELLOW}Consolidating script archives...${NC}"

    # Move everything from _archive to archive
    if [ "$(ls -A scripts/_archive 2>/dev/null)" ]; then
        cp -R scripts/_archive/* scripts/archive/ 2>/dev/null || true
        rm -rf scripts/_archive
        echo -e "${GREEN}✓${NC} Consolidated scripts/_archive → scripts/archive"
        ((moved_count++))
    fi
fi

# Remove duplicate archive directories
if [ -d "scripts/archive_old_migrations" ] && [ -d "scripts/archive" ]; then
    echo -e "${YELLOW}Merging old migrations archive...${NC}"

    if [ "$(ls -A scripts/archive_old_migrations 2>/dev/null)" ]; then
        mkdir -p scripts/archive/old-migrations
        cp -R scripts/archive_old_migrations/* scripts/archive/old-migrations/ 2>/dev/null || true
        rm -rf scripts/archive_old_migrations
        echo -e "${GREEN}✓${NC} Merged scripts/archive_old_migrations → scripts/archive/old-migrations"
        ((moved_count++))
    fi
fi

echo ""
echo -e "${GREEN}✅ Organization Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Moved/organized: $moved_count files"
echo "  - Documentation now in: .claude/vital-expert-docs/"
echo "  - Archives in: docs/archive/"
echo "  - Service docs in: services/*/docs/"
echo ""
echo "🔍 Remaining root markdown files:"
ls -1 *.md 2>/dev/null | wc -l || echo "0"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review the organized structure"
echo "  2. Update any hardcoded paths in documentation"
echo "  3. Run: git status to see changes"
echo "  4. Commit with: git add . && git commit -m 'docs: organize project documentation into .claude structure'"
echo ""
