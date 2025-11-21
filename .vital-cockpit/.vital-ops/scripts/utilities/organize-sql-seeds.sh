#!/bin/bash

# SQL Seeds Organization Script
# Organizes SQL seed files and archives old/obsolete files

set -e

echo "🗄️  Organizing SQL Seed Files..."
echo ""

cd sql/seeds

# Create archive directory with timestamp
ARCHIVE_DIR="archive/preparation-scripts-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

moved=0

echo "📦 Archiving test/deployment SQL files from 00_PREPARATION..."

# Archive test and deployment files
cd 00_PREPARATION
shopt -s nullglob

for file in *TEST*.sql *DEPLOY*.sql *test*.sql *deploy*.sql; do
    if [ -f "$file" ]; then
        mv "$file" "../$ARCHIVE_DIR/"
        echo "✓ Archived: $file"
        moved=$((moved + 1))
    fi
done

# Archive old fix files
for file in FIX_*.sql fix_*.sql *_FIX.sql; do
    if [ -f "$file" ]; then
        mv "$file" "../$ARCHIVE_DIR/"
        echo "✓ Archived: $file"
        moved=$((moved + 1))
    fi
done

# Archive cleanup files
for file in CLEANUP_*.sql cleanup_*.sql; do
    if [ -f "$file" ]; then
        mv "$file" "../$ARCHIVE_DIR/"
        echo "✓ Archived: $file"
        moved=$((moved + 1))
    fi
done

# Archive remediation files
for file in REMEDIATE_*.sql remediate_*.sql; do
    if [ -f "$file" ]; then
        mv "$file" "../$ARCHIVE_DIR/"
        echo "✓ Archived: $file"
        moved=$((moved + 1))
    fi
done

shopt -u nullglob
cd ..

echo ""
echo "📦 Moving documentation to proper location..."

# Move README files to .claude docs
if [ -f "00_MASTER_README.md" ]; then
    mv 00_MASTER_README.md ../../.claude/vital-expert-docs/07-implementation/data-import/SQL_SEEDS_MASTER_README.md
    echo "✓ Moved 00_MASTER_README.md"
    moved=$((moved + 1))
fi

if [ -f "INDEX.md" ]; then
    mv INDEX.md ../../.claude/vital-expert-docs/07-implementation/data-import/SQL_SEEDS_INDEX.md
    echo "✓ Moved INDEX.md"
    moved=$((moved + 1))
fi

if [ -f "QUICK_START.md" ]; then
    mv QUICK_START.md ../../.claude/vital-expert-docs/07-implementation/data-import/SQL_SEEDS_QUICK_START.md
    echo "✓ Moved QUICK_START.md"
    moved=$((moved + 1))
fi

if [ -f "SEED_MIGRATION_MAP.md" ]; then
    mv SEED_MIGRATION_MAP.md ../../.claude/vital-expert-docs/07-implementation/data-import/SEED_MIGRATION_MAP.md
    echo "✓ Moved SEED_MIGRATION_MAP.md"
    moved=$((moved + 1))
fi

if [ -f "WHICH_FILE_TO_USE.md" ]; then
    mv WHICH_FILE_TO_USE.md ../../.claude/vital-expert-docs/07-implementation/data-import/SQL_WHICH_FILE_TO_USE.md
    echo "✓ Moved WHICH_FILE_TO_USE.md"
    moved=$((moved + 1))
fi

# Move other README files to archive
for file in README_*.md INSTRUCTIONS_*.md; do
    if [ -f "$file" ]; then
        mv "$file" "../../docs/archive/misc/"
        echo "✓ Moved $file to archive"
        moved=$((moved + 1))
    fi
done

echo ""
echo "✅ SQL organization complete!"
echo "   Moved/archived: $moved files"
echo ""
echo "📊 Current structure:"
echo "   00_PREPARATION: $(ls -1 00_PREPARATION/*.sql 2>/dev/null | wc -l | tr -d ' ') SQL files"
echo "   02_organization: $(ls -1 02_organization/*.sql 2>/dev/null | wc -l | tr -d ' ') SQL files"
echo "   03_content: $(ls -1 03_content/*.sql 2>/dev/null | wc -l | tr -d ' ') SQL files"
echo "   Archived: $(ls -1 $ARCHIVE_DIR/*.sql 2>/dev/null | wc -l | tr -d ' ') SQL files"
echo ""
