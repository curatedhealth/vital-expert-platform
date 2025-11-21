#!/bin/bash
# ============================================================================
# VITAL Documentation Organization Script
# ============================================================================
# Purpose: Organize markdown files into structured documentation
# Safe: Creates directories, moves files, creates backup list
# ============================================================================

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
cd "$PROJECT_ROOT"

echo "========================================="
echo "🗂️  VITAL Documentation Organization"
echo "========================================="
echo ""

# Create backup list of all markdown files
echo "📋 Creating backup list of all files..."
find . -maxdepth 1 -type f -name "*.md" > .markdown_files_backup.txt
MD_COUNT=$(wc -l < .markdown_files_backup.txt | tr -d ' ')
echo "   Found $MD_COUNT markdown files in root"
echo ""

# Create all necessary directories
echo "📁 Creating directory structure..."
mkdir -p docs/archive/completion-reports
mkdir -p docs/archive/status-updates
mkdir -p docs/archive/fix-reports
mkdir -p docs/archive/migration-reports
mkdir -p docs/archive/misc
echo "   ✅ Directories created"
echo ""

# Move files by category (safe - will not overwrite)
echo "📦 Organizing files..."

# Completion reports
echo "   → Moving completion reports..."
for pattern in "COMPLETE" "COMPLETION" "FINISHED" "DONE"; do
  find . -maxdepth 1 -name "*${pattern}*.md" -exec mv -n {} docs/archive/completion-reports/ \; 2>/dev/null || true
done

# Status updates
echo "   → Moving status updates..."
for pattern in "STATUS" "UPDATE" "PROGRESS" "SUMMARY"; do
  find . -maxdepth 1 -name "*${pattern}*.md" -exec mv -n {} docs/archive/status-updates/ \; 2>/dev/null || true
done

# Fix reports
echo "   → Moving fix reports..."
for pattern in "FIX" "FIXED" "RESOLUTION" "DEBUG" "BUG"; do
  find . -maxdepth 1 -name "*${pattern}*.md" -exec mv -n {} docs/archive/fix-reports/ \; 2>/dev/null || true
done

# Migration reports
echo "   → Moving migration reports..."
for pattern in "MIGRATION" "MIGRATE" "SCHEMA" "DATABASE"; do
  find . -maxdepth 1 -name "*${pattern}*.md" -exec mv -n {} docs/archive/migration-reports/ \; 2>/dev/null || true
done

# Plans and guides
echo "   → Moving plans and guides..."
for pattern in "PLAN" "GUIDE" "ROADMAP" "STRATEGY"; do
  find . -maxdepth 1 -name "*${pattern}*.md" -exec mv -n {} docs/archive/misc/ \; 2>/dev/null || true
done

# Move remaining markdown files (except key docs)
echo "   → Moving remaining files..."
find . -maxdepth 1 -name "*.md" \
  ! -name "README.md" \
  ! -name "DOCUMENTATION_INDEX.md" \
  ! -name "CHANGELOG.md" \
  ! -name "CONTRIBUTING.md" \
  -exec mv -n {} docs/archive/misc/ \; 2>/dev/null || true

echo "   ✅ Files organized"
echo ""

# Count organized files
COMPLETION_COUNT=$(find docs/archive/completion-reports -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
STATUS_COUNT=$(find docs/archive/status-updates -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
FIX_COUNT=$(find docs/archive/fix-reports -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
MIGRATION_COUNT=$(find docs/archive/migration-reports -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
MISC_COUNT=$(find docs/archive/misc -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
REMAINING=$(find . -maxdepth 1 -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

echo "========================================="
echo "✅ ORGANIZATION COMPLETE!"
echo "========================================="
echo ""
echo "📊 Summary:"
echo "   Original files:        $MD_COUNT"
echo "   Completion reports:    $COMPLETION_COUNT"
echo "   Status updates:        $STATUS_COUNT"
echo "   Fix reports:           $FIX_COUNT"
echo "   Migration reports:     $MIGRATION_COUNT"
echo "   Misc docs:             $MISC_COUNT"
echo "   Remaining in root:     $REMAINING"
echo ""
echo "📁 New Structure:"
echo "   docs/archive/completion-reports/"
echo "   docs/archive/status-updates/"
echo "   docs/archive/fix-reports/"
echo "   docs/archive/migration-reports/"
echo "   docs/archive/misc/"
echo ""
echo "📄 Backup list saved: .markdown_files_backup.txt"
echo "========================================="
