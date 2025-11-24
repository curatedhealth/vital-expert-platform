#!/bin/bash
# ============================================================================
# Root Directory Organization Script
# ============================================================================
# Purpose: Move non-essential files from root to organized locations
# Safe: Creates directories, moves files, creates backup log
# ============================================================================

set -e

PROJECT_ROOT="/Users/hichamnaim/Downloads/Cursor/VITAL path"
cd "$PROJECT_ROOT"

echo "========================================="
echo "🗂️  Root Directory Organization"
echo "========================================="
echo ""

# Create backup log
LOG_FILE=".root_files_organization_$(date +%Y%m%d_%H%M%S).log"
echo "Root Files Organization - $(date)" > "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Count initial files
INITIAL_COUNT=$(find . -maxdepth 1 -type f ! -name ".*" | wc -l | tr -d ' ')
echo "📊 Initial state: $INITIAL_COUNT visible files in root"
echo "Initial files: $INITIAL_COUNT" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ============================================================================
# STEP 1: CREATE DIRECTORIES
# ============================================================================

echo "📁 Creating organization directories..."
mkdir -p docs/architecture/schemas
mkdir -p docs/architecture/templates
mkdir -p docs/examples
mkdir -p docs/archive/completion-reports
mkdir -p docs/archive/status-updates
mkdir -p docs/archive/misc
echo "   ✅ Directories created"
echo "" >> "$LOG_FILE"
echo "Directories created:" >> "$LOG_FILE"
echo "  - docs/architecture/schemas" >> "$LOG_FILE"
echo "  - docs/architecture/templates" >> "$LOG_FILE"
echo "  - docs/examples" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# ============================================================================
# STEP 2: MOVE SCHEMA FILES
# ============================================================================

echo "📦 Moving schema files..."
echo "Schema files moved:" >> "$LOG_FILE"

if [ -f "DATABASE_SCHEMA.json" ]; then
  mv "DATABASE_SCHEMA.json" docs/architecture/schemas/
  echo "   ✓ DATABASE_SCHEMA.json → docs/architecture/schemas/"
  echo "  ✓ DATABASE_SCHEMA.json" >> "$LOG_FILE"
fi

echo ""

# ============================================================================
# STEP 3: MOVE TEMPLATE FILES
# ============================================================================

echo "📋 Moving template files..."
echo "" >> "$LOG_FILE"
echo "Template files moved:" >> "$LOG_FILE"

for file in MEDICAL_AFFAIRS_120_JTBD_TEMPLATE.json \
            TEMPLATE_01_AGENTS_FOR_WORKFLOWS.json \
            TEMPLATE_01_AGENTS_WITH_EXISTING_MAPPED.json \
            TEMPLATE_02_PERSONAS_WITH_ORG_MAPPING.json \
            TEMPLATE_03_PROMPT_SUITES_COMPLETE.json; do
  if [ -f "$file" ]; then
    mv "$file" docs/architecture/templates/
    echo "   ✓ $file → docs/architecture/templates/"
    echo "  ✓ $file" >> "$LOG_FILE"
  fi
done

echo ""

# ============================================================================
# STEP 4: MOVE COMPLETION REPORTS
# ============================================================================

echo "📄 Moving completion reports..."
echo "" >> "$LOG_FILE"
echo "Completion reports moved:" >> "$LOG_FILE"

for file in PHASE_1_COMPLETE_CONSOLIDATED_SUMMARY.txt \
            PHASE_1_COMPLETE_EXECUTIVE_SUMMARY.txt \
            FINAL_DELIVERY_SUMMARY.txt \
            FINAL_DELIVERY.txt \
            PERSONA_CATALOGUE_EXECUTIVE_SUMMARY.txt \
            PERSONA_DATABASE_IMPORT_COMPLETE.txt \
            DH_PERSONAS_JTBD_IMPORT_COMPLETE.txt \
            DH_JTBD_SUCCESS_SUMMARY.txt \
            DH_JTBD_SCHEMA_COMPLETE.txt \
            DH_SCHEMA_READY.txt \
            NOTION_INTEGRATION_SUMMARY.txt; do
  if [ -f "$file" ]; then
    mv "$file" docs/archive/completion-reports/
    echo "   ✓ $file → docs/archive/completion-reports/"
    echo "  ✓ $file" >> "$LOG_FILE"
  fi
done

echo ""

# ============================================================================
# STEP 5: MOVE STATUS UPDATES
# ============================================================================

echo "📊 Moving status updates..."
echo "" >> "$LOG_FILE"
echo "Status updates moved:" >> "$LOG_FILE"

if [ -f "SUPABASE_QUICK_STATUS.txt" ]; then
  mv "SUPABASE_QUICK_STATUS.txt" docs/archive/status-updates/
  echo "   ✓ SUPABASE_QUICK_STATUS.txt → docs/archive/status-updates/"
  echo "  ✓ SUPABASE_QUICK_STATUS.txt" >> "$LOG_FILE"
fi

echo ""

# ============================================================================
# STEP 6: MOVE CODE EXAMPLES
# ============================================================================

echo "💻 Moving code examples..."
echo "" >> "$LOG_FILE"
echo "Code examples moved:" >> "$LOG_FILE"

if [ -f "INTERACTIVE_WORKFLOW_USAGE_EXAMPLES.tsx" ]; then
  mv "INTERACTIVE_WORKFLOW_USAGE_EXAMPLES.tsx" docs/examples/
  echo "   ✓ INTERACTIVE_WORKFLOW_USAGE_EXAMPLES.tsx → docs/examples/"
  echo "  ✓ INTERACTIVE_WORKFLOW_USAGE_EXAMPLES.tsx" >> "$LOG_FILE"
fi

echo ""

# ============================================================================
# STEP 7: MOVE DEBUG/MISC FILES
# ============================================================================

echo "🔧 Moving debug/misc files..."
echo "" >> "$LOG_FILE"
echo "Debug/misc files moved:" >> "$LOG_FILE"

if [ -f "MODE1_DEBUG_LOGGING.patch" ]; then
  mv "MODE1_DEBUG_LOGGING.patch" docs/archive/misc/
  echo "   ✓ MODE1_DEBUG_LOGGING.patch → docs/archive/misc/"
  echo "  ✓ MODE1_DEBUG_LOGGING.patch" >> "$LOG_FILE"
fi

echo ""

# ============================================================================
# STEP 8: ARCHIVE BACKUP FILE (optional)
# ============================================================================

echo "🗄️  Archiving backup files..."
if [ -f ".markdown_files_backup.txt" ]; then
  mv ".markdown_files_backup.txt" docs/archive/misc/
  echo "   ✓ .markdown_files_backup.txt → docs/archive/misc/"
  echo "  ✓ .markdown_files_backup.txt" >> "$LOG_FILE"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

FINAL_COUNT=$(find . -maxdepth 1 -type f ! -name ".*" ! -name "$LOG_FILE" | wc -l | tr -d ' ')
MOVED_COUNT=$((INITIAL_COUNT - FINAL_COUNT))

echo "==========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "Summary:" >> "$LOG_FILE"
echo "  Initial files: $INITIAL_COUNT" >> "$LOG_FILE"
echo "  Final files: $FINAL_COUNT" >> "$LOG_FILE"
echo "  Files moved: $MOVED_COUNT" >> "$LOG_FILE"
echo "  Reduction: $(echo "scale=1; ($MOVED_COUNT * 100) / $INITIAL_COUNT" | bc)%" >> "$LOG_FILE"

echo "========================================="
echo "✅ ROOT ORGANIZATION COMPLETE!"
echo "========================================="
echo ""
echo "📊 Summary:"
echo "   Initial files:     $INITIAL_COUNT"
echo "   Final files:       $FINAL_COUNT"
echo "   Files moved:       $MOVED_COUNT"
echo "   Reduction:         $(echo "scale=1; ($MOVED_COUNT * 100) / $INITIAL_COUNT" | bc)%"
echo ""
echo "📁 Files moved to:"
echo "   • docs/architecture/schemas/     - Database schemas"
echo "   • docs/architecture/templates/   - JSON templates"
echo "   • docs/examples/                 - Code examples"
echo "   • docs/archive/completion-reports/ - Completion reports"
echo "   • docs/archive/status-updates/   - Status updates"
echo "   • docs/archive/misc/             - Misc files"
echo ""
echo "📄 Log file created: $LOG_FILE"
echo ""
echo "🎯 Remaining in root:"
ls -1 | grep -v "^\." | head -20
echo ""
echo "========================================="
