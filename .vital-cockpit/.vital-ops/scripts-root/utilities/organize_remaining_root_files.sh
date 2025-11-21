#!/bin/bash
# ============================================================================
# Organize Remaining Root Files
# ============================================================================

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
cd "$PROJECT_ROOT"

echo "========================================="
echo "🧹 Organizing Remaining Root Files"
echo "========================================="
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p scripts/archive
mkdir -p scripts/sql/utilities
mkdir -p scripts/utilities
mkdir -p logs
mkdir -p .tmp
echo "   ✅ Directories created"
echo ""

# Move log files
echo "📝 Moving log files..."
mv *.log logs/ 2>/dev/null || true
mv *.pid logs/ 2>/dev/null || true
echo "   ✅ Log files moved to logs/"
echo ""

# Move SQL utility files
echo "🗄️  Moving SQL utility files..."
mv check_*.sql scripts/sql/utilities/ 2>/dev/null || true
mv verify_migration.sql scripts/sql/utilities/ 2>/dev/null || true
echo "   ✅ SQL files moved to scripts/sql/utilities/"
echo ""

# Move Python scripts
echo "🐍 Moving Python scripts..."
mv apply_migration.py scripts/archive/ 2>/dev/null || true
mv assign_rag_to_agents.py scripts/archive/ 2>/dev/null || true
mv update_agents_diagrams.py scripts/archive/ 2>/dev/null || true
echo "   ✅ Python scripts moved to scripts/archive/"
echo ""

# Move shell scripts
echo "🔧 Moving shell scripts..."
mv apply_migration_now.sh scripts/archive/ 2>/dev/null || true
mv fix-nextjs-lock.sh scripts/utilities/ 2>/dev/null || true
mv install-observability.sh scripts/utilities/ 2>/dev/null || true
mv setup-env.sh scripts/utilities/ 2>/dev/null || true
mv sync-env.sh scripts/utilities/ 2>/dev/null || true
mv start-all-services.sh . 2>/dev/null || true  # Keep in root - useful
mv run_tests.sh . 2>/dev/null || true  # Keep in root - useful
echo "   ✅ Shell scripts organized"
echo ""

# Count final files
FINAL_COUNT=$(ls -1 | grep -v "^\." | wc -l | tr -d ' ')

echo "========================================="
echo "✅ CLEANUP COMPLETE!"
echo "========================================="
echo ""
echo "📊 Remaining visible files: $FINAL_COUNT"
echo ""
echo "🎯 Files kept in root:"
ls -1 | grep -v "^\." | head -25
echo ""
echo "========================================="
