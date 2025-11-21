#!/bin/bash

# Scripts Directory Consolidation
# Merges duplicate archive directories and organizes Python/shell scripts

set -e

echo "📜 Consolidating Scripts Directories..."
echo ""

cd scripts

moved=0

# ============================================================================
# Consolidate archive directories
# ============================================================================
echo "📦 Consolidating archive directories..."

if [ -d "_archive" ]; then
    if [ "$(ls -A _archive 2>/dev/null)" ]; then
        mkdir -p archive
        # Copy contents preserving structure
        cp -R _archive/* archive/ 2>/dev/null || true
        # Remove _archive
        rm -rf _archive
        echo "✓ Merged _archive/ → archive/"
        moved=$((moved + 1))
    else
        rm -rf _archive
        echo "✓ Removed empty _archive/"
    fi
fi

if [ -d "archive_old_migrations" ]; then
    if [ "$(ls -A archive_old_migrations 2>/dev/null)" ]; then
        mkdir -p archive/old-migrations
        cp -R archive_old_migrations/* archive/old-migrations/ 2>/dev/null || true
        rm -rf archive_old_old_migrations
        echo "✓ Merged archive_old_migrations/ → archive/old-migrations/"
        moved=$((moved + 1))
    else
        rm -rf archive_old_migrations
        echo "✓ Removed empty archive_old_migrations/"
    fi
fi

# ============================================================================
# Move duplicate migration scripts
# ============================================================================
echo ""
echo "📦 Organizing migration scripts..."

if [ -d "migrations" ] && [ -d "migration" ]; then
    if [ "$(ls -A migration 2>/dev/null)" ]; then
        mkdir -p archive/old-migrations
        cp -R migration/* archive/old-migrations/ 2>/dev/null || true
        rm -rf migration
        echo "✓ Archived migration/ → archive/old-migrations/"
        moved=$((moved + 1))
    else
        rm -rf migration
        echo "✓ Removed empty migration/"
    fi
fi

# ============================================================================
# Move Python scripts with documentation to proper location
# ============================================================================
echo ""
echo "📦 Moving scripts documentation..."

# Move script READMEs to docs
shopt -s nullglob
for readme in README*.md; do
    if [ -f "$readme" ]; then
        # Check if it's in utilities subdirectory
        if [ ! "$readme" = "utilities/README_EXPORT.md" ]; then
            mv "$readme" "../docs/archive/misc/"
            echo "✓ Moved $readme to docs/archive/misc/"
            moved=$((moved + 1))
        fi
    fi
done
shopt -u nullglob

# ============================================================================
# Count and report
# ============================================================================
echo ""
echo "✅ Scripts consolidation complete!"
echo "   Actions taken: $moved"
echo ""
echo "📊 Current scripts structure:"
find . -maxdepth 1 -type d ! -name "." ! -name ".." | while read dir; do
    py_count=$(find "$dir" -type f -name "*.py" 2>/dev/null | wc -l | tr -d ' ')
    sh_count=$(find "$dir" -type f -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$py_count" != "0" ] || [ "$sh_count" != "0" ]; then
        echo "   $(basename "$dir"): ${py_count} Python, ${sh_count} Shell scripts"
    fi
done
echo ""
