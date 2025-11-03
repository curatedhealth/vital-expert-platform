#!/bin/bash
#
# Quick Documentation Cleanup Script
# Simplified version for reliable execution
#

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
cd "$PROJECT_ROOT"

echo "🧹 Starting Documentation Cleanup..."
echo ""

# Create backup
BACKUP_DIR="./backups/doc-cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Creating backup..."
cp *.md "$BACKUP_DIR/" 2>/dev/null || true
cp *.sh "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created: $BACKUP_DIR"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p docs/archive/2025-11/{phases,fixes,debug,status,misc}
mkdir -p docs/reports/audits
mkdir -p docs/guides/{deployment,development,testing,operations}
mkdir -p docs/implementation/{features,integrations}
mkdir -p docs/architecture/current
mkdir -p docs/status/{phases,current}
mkdir -p scripts/database
echo "✅ Directory structure created"
echo ""

# Move files by category
MOVED=0

echo "📝 Moving files to archive..."

# Phase files
for file in PHASE_*.md; do
    [ -f "$file" ] && mv "$file" "docs/archive/2025-11/phases/" && ((MOVED++)) && echo "  ✓ $file"
done

# Complete/Summary files
for file in *_COMPLETE*.md *_SUMMARY*.md ALL_*.md; do
    [ -f "$file" ] && mv "$file" "docs/archive/2025-11/phases/" && ((MOVED++)) && echo "  ✓ $file"
done

# Fix files
for file in *_FIX*.md *_FIXED*.md *_ISSUE*.md; do
    [ -f "$file" ] && mv "$file" "docs/archive/2025-11/fixes/" && ((MOVED++)) && echo "  ✓ $file"
done

# Debug/Analysis files
for file in *_DEBUG*.md *_ANALYSIS*.md *_DIAGNOSTIC*.md; do
    [ -f "$file" ] && mv "$file" "docs/archive/2025-11/debug/" && ((MOVED++)) && echo "  ✓ $file"
done

# Status files
for file in *_STATUS*.md; do
    [ -f "$file" ] && mv "$file" "docs/archive/2025-11/status/" && ((MOVED++)) && echo "  ✓ $file"
done

# Audit/Report files
for file in *_AUDIT*.md *_REPORT*.md *AUDIT*.md *REPORT*.md; do
    [ -f "$file" ] && mv "$file" "docs/reports/audits/" && ((MOVED++)) && echo "  ✓ $file"
done

# Guide files
for file in *_GUIDE*.md *GUIDE*.md; do
    [ -f "$file" ] && mv "$file" "docs/guides/development/" && ((MOVED++)) && echo "  ✓ $file"
done

# Setup/Instructions files
for file in *_SETUP*.md *_INSTRUCTIONS*.md *SETUP*.md; do
    [ -f "$file" ] && mv "$file" "docs/guides/development/" && ((MOVED++)) && echo "  ✓ $file"
done

# Deployment files
for file in *DEPLOY*.md *DEPLOYMENT*.md; do
    [ -f "$file" ] && [ "$file" != "DEPLOYMENT_GUIDE.md" ] && mv "$file" "docs/guides/deployment/" && ((MOVED++)) && echo "  ✓ $file"
done

# Implementation files
for file in *IMPLEMENTATION*.md; do
    [ -f "$file" ] && mv "$file" "docs/implementation/features/" && ((MOVED++)) && echo "  ✓ $file"
done

# Integration files
for file in *INTEGRATION*.md; do
    [ -f "$file" ] && mv "$file" "docs/implementation/integrations/" && ((MOVED++)) && echo "  ✓ $file"
done

# Architecture files
for file in *ARCHITECTURE*.md; do
    [ -f "$file" ] && mv "$file" "docs/architecture/current/" && ((MOVED++)) && echo "  ✓ $file"
done

# Everything else goes to misc archive
for file in *.md; do
    # Skip essential files
    if [[ "$file" != "README.md" && "$file" != "LICENSE.md" && "$file" != "DOCUMENTATION_INDEX.md" && "$file" != "PRE_DEPLOYMENT_CLEANUP_AUDIT.md" && "$file" != "PRE_DEPLOYMENT_AUDIT_SUMMARY.md" ]]; then
        [ -f "$file" ] && mv "$file" "docs/archive/2025-11/misc/" && ((MOVED++)) && echo "  ✓ $file"
    fi
done

echo ""
echo "📊 Statistics:"
echo "  Files moved: $MOVED"
echo "  Files kept at root: $(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "✅ Documentation cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Review: ls -la"
echo "  2. Check docs: ls -la docs/"
echo "  3. Verify deployment scripts still work"
echo ""

