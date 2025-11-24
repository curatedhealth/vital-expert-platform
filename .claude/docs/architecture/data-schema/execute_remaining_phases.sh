#!/bin/bash
# ===========================================
# AgentOS 2.0 Complete Execution Script
# ===========================================
# This script executes all remaining phases (4-9) of the AgentOS 2.0 schema evolution
# Prerequisites: Phases 1-3 must already be executed
# ===========================================

set -e  # Exit on error

echo "========================================="
echo "AgentOS 2.0 Schema Execution"
echo "========================================="
echo ""

# Get database connection details
read -p "Enter Supabase Project URL (or 'skip' to see SQL): " PROJECT_URL

if [ "$PROJECT_URL" = "skip" ]; then
    echo ""
    echo "📋 EXECUTION INSTRUCTIONS:"
    echo ""
    echo "Copy and paste each file into Supabase SQL Editor in this order:"
    echo ""
    echo "1. migrations/phase4_rag_profiles.sql"
    echo "2. migrations/phase5_routing_policies.sql"
    echo "3. migrations/phase6_tool_schemas.sql"
    echo "4. migrations/phase7_eval_framework.sql"
    echo "5. migrations/phase8_versioning_marketplace.sql"
    echo "6. views/agent_comprehensive_views.sql"
    echo ""
    echo "Run verification after each phase:"
    echo "- migrations/verification/phase4_verification.sql"
    echo "- migrations/verification/phase5_verification.sql"
    echo "- ... etc"
    echo ""
    exit 0
fi

read -p "Enter database name: " DB_NAME
read -p "Enter database user: " DB_USER
read -sp "Enter database password: " DB_PASS
echo ""

# Set PGPASSWORD for non-interactive execution
export PGPASSWORD="$DB_PASS"

MIGRATIONS_DIR="$(dirname "$0")/migrations"
VIEWS_DIR="$(dirname "$0")/views"
VERIFY_DIR="$MIGRATIONS_DIR/verification"

# Phase 4: RAG Profiles
echo ""
echo "📦 Executing Phase 4: RAG Profiles & Policies..."
psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/phase4_rag_profiles.sql"
echo "✅ Phase 4 complete"

echo ""
read -p "Verify Phase 4? (y/n): " verify
if [ "$verify" = "y" ]; then
    psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VERIFY_DIR/phase4_verification.sql"
fi

# Phase 5: Routing Policies
echo ""
echo "📦 Executing Phase 5: Routing Policies & Control Plane..."
psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/phase5_routing_policies.sql"
echo "✅ Phase 5 complete"

echo ""
read -p "Verify Phase 5? (y/n): " verify
if [ "$verify" = "y" ]; then
    psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VERIFY_DIR/phase5_verification.sql"
fi

# Phase 6: Tool Schemas
echo ""
echo "📦 Executing Phase 6: Tool Schemas & Hardening..."
psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/phase6_tool_schemas.sql"
echo "✅ Phase 6 complete"

echo ""
read -p "Verify Phase 6? (y/n): " verify
if [ "$verify" = "y" ]; then
    psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VERIFY_DIR/phase6_verification.sql"
fi

# Phase 7: Evaluation Framework
echo ""
echo "📦 Executing Phase 7: Evaluation Framework..."
psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/phase7_eval_framework.sql"
echo "✅ Phase 7 complete"

echo ""
read -p "Verify Phase 7? (y/n): " verify
if [ "$verify" = "y" ]; then
    psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VERIFY_DIR/phase7_verification.sql"
fi

# Phase 8: Versioning & Marketplace
echo ""
echo "📦 Executing Phase 8: Versioning, Discovery & Marketplace..."
psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/phase8_versioning_marketplace.sql"
echo "✅ Phase 8 complete"

echo ""
read -p "Verify Phase 8? (y/n): " verify
if [ "$verify" = "y" ]; then
    psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VERIFY_DIR/phase8_verification.sql"
fi

# Phase 9: Comprehensive Views
echo ""
echo "📦 Executing Phase 9: Comprehensive Views & Documentation..."
psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VIEWS_DIR/agent_comprehensive_views.sql"
echo "✅ Phase 9 complete"

echo ""
read -p "Verify Phase 9? (y/n): " verify
if [ "$verify" = "y" ]; then
    psql -h "$PROJECT_URL" -U "$DB_USER" -d "$DB_NAME" -f "$VERIFY_DIR/phase9_verification.sql"
fi

# Clear password from environment
unset PGPASSWORD

echo ""
echo "========================================="
echo "🎉 AgentOS 2.0 Schema Complete!"
echo "========================================="
echo ""
echo "✅ All 9 phases executed successfully"
echo "📊 Total: 35 tables + 6 views + 101 indexes"
echo ""
echo "Next steps:"
echo "1. Review verification outputs"
echo "2. Seed agent data"
echo "3. Update application code"
echo ""

