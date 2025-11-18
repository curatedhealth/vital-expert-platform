#!/bin/bash
# ============================================================================
# VITAL Project Structure Organization Script
# ============================================================================
# Purpose: Organize markdown files, scripts, and migrations into clean structure
# Author: VITAL Team
# Date: 2025-01-10
# ============================================================================

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
cd "$PROJECT_ROOT"

echo "========================================="
echo "🗂️  VITAL Project Organization"
echo "========================================="

# ============================================================================
# 1. ORGANIZE MARKDOWN FILES BY CATEGORY
# ============================================================================

echo "📄 Organizing markdown files..."

# Status Reports & Completion Summaries
mkdir -p docs/status-reports/{agent-fixes,api-fixes,database-fixes,ui-improvements,migrations,integrations}
mv *COMPLETE*.md docs/status-reports/ 2>/dev/null || true
mv *STATUS*.md docs/status-reports/ 2>/dev/null || true
mv *SUMMARY*.md docs/status-reports/ 2>/dev/null || true
mv *REPORT*.md docs/status-reports/ 2>/dev/null || true
mv *AUDIT*.md docs/status-reports/ 2>/dev/null || true

# Agent-related docs
mv AGENT_*.md docs/status-reports/agent-fixes/ 2>/dev/null || true
mv docs/status-reports/AGENT_*.md docs/status-reports/agent-fixes/ 2>/dev/null || true

# API-related docs
mv *API*.md docs/status-reports/api-fixes/ 2>/dev/null || true
mv docs/status-reports/*API*.md docs/status-reports/api-fixes/ 2>/dev/null || true

# Database & Migration docs
mv *MIGRATION*.md docs/migration-logs/ 2>/dev/null || true
mv *SCHEMA*.md docs/architecture/ 2>/dev/null || true
mv DATABASE_*.md docs/architecture/ 2>/dev/null || true

# Guides & Quick Starts
mkdir -p docs/guides/{quickstart,troubleshooting,development}
mv *QUICK_START*.md docs/guides/quickstart/ 2>/dev/null || true
mv *GUIDE*.md docs/guides/ 2>/dev/null || true
mv *FIX*.md docs/guides/troubleshooting/ 2>/dev/null || true

# Architecture & Design
mv *ARCHITECTURE*.md docs/architecture/ 2>/dev/null || true
mv *DESIGN*.md docs/architecture/ 2>/dev/null || true
mv *SCHEMA*.md docs/architecture/ 2>/dev/null || true

# Plans & Roadmaps
mkdir -p docs/planning/{migration-plans,feature-plans,roadmaps}
mv *PLAN*.md docs/planning/migration-plans/ 2>/dev/null || true
mv *ROADMAP*.md docs/planning/roadmaps/ 2>/dev/null || true

# Implementation & Deployment
mkdir -p docs/deployment
mv *IMPLEMENTATION*.md docs/deployment/ 2>/dev/null || true
mv *DEPLOYMENT*.md docs/deployment/ 2>/dev/null || true

# Visual & UX docs
mkdir -p docs/guides/ux-visual
mv *VISUAL*.md docs/guides/ux-visual/ 2>/dev/null || true
mv *UX*.md docs/guides/ux-visual/ 2>/dev/null || true

echo "✅ Markdown files organized"

# ============================================================================
# 2. ORGANIZE SCRIPTS BY PURPOSE
# ============================================================================

echo "🔧 Organizing scripts..."

# Migration scripts
mv scripts/*migration*.py scripts/migrations/ 2>/dev/null || true
mv scripts/*phase*.py scripts/migrations/ 2>/dev/null || true
mv scripts/migration_*.py scripts/migrations/ 2>/dev/null || true

# Import scripts
mkdir -p scripts/data-import/{personas,agents,workflows,prompts}
mv scripts/import_*.py scripts/data-import/ 2>/dev/null || true
mv scripts/*import*.py scripts/data-import/ 2>/dev/null || true

# Enrichment scripts
mkdir -p scripts/data-import/enrichment
mv scripts/enrich_*.py scripts/data-import/enrichment/ 2>/dev/null || true

# Utility scripts
mv scripts/verify_*.py scripts/utilities/ 2>/dev/null || true
mv scripts/check_*.py scripts/utilities/ 2>/dev/null || true
mv scripts/cleanup_*.py scripts/utilities/ 2>/dev/null || true
mv scripts/seed_*.py scripts/utilities/ 2>/dev/null || true

# Update scripts
mkdir -p scripts/data-import/updates
mv scripts/update_*.py scripts/data-import/updates/ 2>/dev/null || true

# Archive old scripts
mv scripts/apply_*.py scripts/archive/ 2>/dev/null || true

echo "✅ Scripts organized"

# ============================================================================
# 3. ORGANIZE MIGRATIONS
# ============================================================================

echo "🗄️  Organizing migrations..."

# Move completed migrations to archive
cd supabase/migrations
# Keep only the most recent migrations active

# Move old/duplicate migrations
for file in 202410*.sql 202409*.sql; do
  [ -f "$file" ] && mv "$file" archive/ 2>/dev/null || true
done

cd "$PROJECT_ROOT"

echo "✅ Migrations organized"

# ============================================================================
# 4. ORGANIZE SQL FILES IN SCRIPTS
# ============================================================================

echo "🗃️  Organizing SQL files..."

mkdir -p scripts/sql/{schema,data,utilities,archive}

# Schema files
mv scripts/*CREATE*.sql scripts/sql/schema/ 2>/dev/null || true
mv scripts/*schema*.sql scripts/sql/schema/ 2>/dev/null || true

# Data files
mv scripts/*.sql scripts/sql/archive/ 2>/dev/null || true

# Utility SQL
mv *.sql scripts/sql/utilities/ 2>/dev/null || true

echo "✅ SQL files organized"

# ============================================================================
# 5. CLEAN UP ROOT DIRECTORY
# ============================================================================

echo "🧹 Cleaning root directory..."

# Move JSON/config files
mkdir -p docs/architecture/schemas
mv DATABASE_SCHEMA.json docs/architecture/schemas/ 2>/dev/null || true

# Archive apply scripts
mv apply_*.py scripts/archive/ 2>/dev/null || true
mv apply_*.sh scripts/archive/ 2>/dev/null || true

echo "✅ Root directory cleaned"

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo "========================================="
echo "✅ ORGANIZATION COMPLETE!"
echo "========================================="
echo ""
echo "📁 New Structure:"
echo "  docs/"
echo "    ├── architecture/       - System design & schemas"
echo "    ├── guides/            - Development & usage guides"
echo "    ├── status-reports/    - Completion & status docs"
echo "    ├── migration-logs/    - Migration documentation"
echo "    ├── planning/          - Plans & roadmaps"
echo "    └── deployment/        - Deployment docs"
echo ""
echo "  scripts/"
echo "    ├── migrations/        - Database migrations"
echo "    ├── data-import/       - Data import scripts"
echo "    ├── utilities/         - Utility scripts"
echo "    └── archive/           - Old/deprecated scripts"
echo ""
echo "  supabase/migrations/"
echo "    ├── [active migrations]"
echo "    └── archive/           - Old migrations"
echo ""
echo "========================================="
