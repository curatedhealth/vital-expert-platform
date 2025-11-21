#!/bin/bash

# Helper script to copy migration files for Supabase Dashboard SQL Editor
# Usage: ./copy-for-dashboard.sh [file_number]
# Example: ./copy-for-dashboard.sh 1    (copies 001_schema_fixes.sql to clipboard)

set -e

MIGRATIONS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=================================="
echo "VITAL Migration Helper"
echo "=================================="
echo ""

# Map of migration files
declare -A MIGRATIONS
MIGRATIONS[0]="000_pre_migration_validation.sql"
MIGRATIONS[1]="001_schema_fixes.sql"
MIGRATIONS[2]="002_tenant_setup.sql"
MIGRATIONS[3]="003_platform_data_migration.sql"
MIGRATIONS[4]="004_tenant_data_migration.sql"
MIGRATIONS[5]="005_post_migration_validation.sql"

# If no argument, show menu
if [ -z "$1" ]; then
  echo "Select migration to copy:"
  echo ""
  echo "  0. Pre-migration validation"
  echo "  1. Schema fixes"
  echo "  2. Tenant setup"
  echo "  3. Platform data migration"
  echo "  4. Tenant data migration"
  echo "  5. Post-migration validation"
  echo ""
  echo "  a. All (open Supabase Dashboard)"
  echo ""
  read -p "Enter number (0-5) or 'a' for all: " choice
else
  choice=$1
fi

# Function to copy file to clipboard
copy_file() {
  local num=$1
  local filename="${MIGRATIONS[$num]}"

  if [ -z "$filename" ]; then
    echo "❌ Invalid file number: $num"
    exit 1
  fi

  local filepath="$MIGRATIONS_DIR/$filename"

  if [ ! -f "$filepath" ]; then
    echo "❌ File not found: $filepath"
    exit 1
  fi

  # Copy to clipboard (works on macOS)
  cat "$filepath" | pbcopy

  echo ""
  echo "✅ Copied to clipboard: $filename"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Open Supabase Dashboard SQL Editor"
  echo "   2. Paste (Cmd+V) into the editor"
  echo "   3. Click 'Run' button"
  echo "   4. Wait for completion and check for errors"
  echo ""

  # Show file preview
  echo "Preview (first 20 lines):"
  echo "-----------------------------------"
  head -20 "$filepath"
  echo "-----------------------------------"
  echo ""
}

# Handle choice
if [ "$choice" == "a" ]; then
  echo "📂 Opening Supabase Dashboard..."
  echo ""
  echo "🔗 Dashboard URL: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql"
  echo ""

  # Try to open in browser
  if command -v open &> /dev/null; then
    open "https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql"
  fi

  echo "📝 Migration files in order:"
  for i in {0..5}; do
    echo "   $i. ${MIGRATIONS[$i]}"
  done
  echo ""
  echo "Run this script again with a file number to copy it."
  echo "Example: ./copy-for-dashboard.sh 1"
  echo ""

elif [[ "$choice" =~ ^[0-5]$ ]]; then
  copy_file "$choice"
else
  echo "❌ Invalid choice: $choice"
  echo "Please enter a number from 0-5, or 'a' for all."
  exit 1
fi
