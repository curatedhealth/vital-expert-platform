#!/bin/bash

# Simple documentation organization script
# Run with: bash scripts/utilities/organize-docs-simple.sh

set -e

echo "🧹 Organizing VITAL Platform Documentation..."

# Create all necessary directories
mkdir -p .claude/vital-expert-docs/{00-overview,01-strategy,02-brand-identity,03-product,04-services,05-architecture,06-workflows,07-implementation,08-agents,09-api,10-knowledge-assets,11-testing,12-operations,13-compliance,14-training,15-releases}
mkdir -p .claude/vital-expert-docs/04-services/{ask-expert,ask-panel,ask-committee,byoai-orchestration}
mkdir -p .claude/vital-expert-docs/05-architecture/{frontend,backend,data,security,infrastructure}
mkdir -p .claude/vital-expert-docs/07-implementation/{deployment-guides,data-import,integration-guides}
mkdir -p .claude/vital-expert-docs/10-knowledge-assets/{personas,prompts,tools}
mkdir -p docs/archive/{completion-reports,migration-reports,status-updates,fix-reports,misc}
mkdir -p services/ai-engine/docs

moved=0

# Function to safely move files
safe_move() {
    local pattern="$1"
    local dest="$2"

    shopt -s nullglob
    for file in $pattern; do
        if [ -f "$file" ]; then
            if mv "$file" "$dest/" 2>/dev/null; then
                echo "✓ $(basename "$file")"
                moved=$((moved + 1))
            fi
        fi
    done
    shopt -u nullglob
}

echo ""
echo "📦 Moving Agent documentation..."
safe_move "AGENT*.md" ".claude/vital-expert-docs/08-agents"
safe_move "*AGENTS*.md" "docs/archive/completion-reports"

echo ""
echo "📦 Moving Database & Schema docs..."
safe_move "DATABASE*.md" ".claude/vital-expert-docs/05-architecture/data"
safe_move "DATA*.md" ".claude/vital-expert-docs/05-architecture/data"
safe_move "*SCHEMA*.md" ".claude/vital-expert-docs/05-architecture/data"

echo ""
echo "📦 Moving API & Backend docs..."
safe_move "API*.md" ".claude/vital-expert-docs/09-api"
safe_move "BACKEND*.md" ".claude/vital-expert-docs/09-api"

echo ""
echo "📦 Moving Frontend docs..."
safe_move "FRONTEND*.md" ".claude/vital-expert-docs/05-architecture/frontend"
safe_move "COMPONENT*.md" ".claude/vital-expert-docs/05-architecture/frontend"
safe_move "SIDEBAR*.md" ".claude/vital-expert-docs/05-architecture/frontend"

echo ""
echo "📦 Moving Service docs (Ask Panel/Expert/Committee)..."
safe_move "ASK_EXPERT*.md" ".claude/vital-expert-docs/04-services/ask-expert"
safe_move "ASK_PANEL*.md" ".claude/vital-expert-docs/04-services/ask-panel"
safe_move "ASK_COMMITTEE*.md" ".claude/vital-expert-docs/04-services/ask-committee"

echo ""
echo "📦 Moving Workflow docs..."
safe_move "*WORKFLOW*.md" ".claude/vital-expert-docs/06-workflows"
safe_move "HIERARCHICAL*.md" ".claude/vital-expert-docs/06-workflows"
safe_move "DIGITAL_HEALTH*.md" ".claude/vital-expert-docs/06-workflows"

echo ""
echo "📦 Moving Persona docs..."
safe_move "PERSONA*.md" ".claude/vital-expert-docs/10-knowledge-assets/personas"
safe_move "PHARMA*.md" "docs/archive/completion-reports"

echo ""
echo "📦 Moving Prompt docs..."
safe_move "PROMPT*.md" ".claude/vital-expert-docs/10-knowledge-assets/prompts"
safe_move "*PROMPTS*.md" ".claude/vital-expert-docs/10-knowledge-assets/prompts"

echo ""
echo "📦 Moving Deployment & Implementation docs..."
safe_move "*DEPLOYMENT*.md" ".claude/vital-expert-docs/07-implementation/deployment-guides"
safe_move "*IMPLEMENTATION*.md" "docs/archive/completion-reports"
safe_move "SUPABASE*.md" "docs/archive/completion-reports"
safe_move "*IMPORT*.md" ".claude/vital-expert-docs/07-implementation/data-import"
safe_move "*SEED*.md" ".claude/vital-expert-docs/07-implementation/data-import"

echo ""
echo "📦 Moving Migration docs..."
safe_move "MIGRATION*.md" "docs/archive/migration-reports"
safe_move "*MIGRATION*.md" "docs/archive/migration-reports"
safe_move "POST_MIGRATION*.md" "docs/archive/migration-reports"

echo ""
echo "📦 Moving Build & Error Fix docs..."
safe_move "BUILD*.md" "docs/archive/fix-reports"
safe_move "*ERROR*.md" "docs/archive/fix-reports"
safe_move "*FIX*.md" "docs/archive/fix-reports"
safe_move "*FIXES*.md" "docs/archive/fix-reports"

echo ""
echo "📦 Moving Status reports..."
safe_move "*STATUS*.md" "docs/archive/status-updates"
safe_move "CURRENT*.md" "docs/archive/status-updates"

echo ""
echo "📦 Moving Completion reports..."
safe_move "*COMPLETE*.md" "docs/archive/completion-reports"
safe_move "*SUMMARY*.md" "docs/archive/completion-reports"
safe_move "FINAL*.md" "docs/archive/completion-reports"
safe_move "*READY*.md" "docs/archive/completion-reports"
safe_move "HANDOFF*.md" "docs/archive/completion-reports"
safe_move "WORK_COMPLETED*.md" "docs/archive/completion-reports"
safe_move "SYSTEM_READY*.md" "docs/archive/completion-reports"

echo ""
echo "📦 Moving Testing docs..."
safe_move "*TESTING*.md" ".claude/vital-expert-docs/11-testing"
safe_move "POSTMAN*.md" ".claude/vital-expert-docs/11-testing"

echo ""
echo "📦 Moving Miscellaneous docs..."
safe_move "ACTION_REQUIRED*.md" "docs/archive/misc"
safe_move "NEXT_STEPS*.md" "docs/archive/misc"
safe_move "START_HERE*.md" "docs/archive/misc"
safe_move "*CLEANUP*.md" "docs/archive/misc"
safe_move "*CONVERSATION*.md" "docs/archive/misc"
safe_move "SQL_*.md" "docs/archive/misc"
safe_move "PROJECT_*.md" "docs/archive/misc"
safe_move "ROOT_*.md" "docs/archive/misc"
safe_move "COMMANDS*.md" ".claude/vital-expert-docs/00-overview"

echo ""
echo "📦 Moving remaining docs to archive..."
shopt -s nullglob
for file in *.md; do
    if [ -f "$file" ]; then
        # Skip README files
        if [[ "$file" == README* ]]; then
            continue
        fi
        if mv "$file" "docs/archive/misc/" 2>/dev/null; then
            echo "✓ $file → misc"
            moved=$((moved + 1))
        fi
    fi
done
shopt -u nullglob

echo ""
echo "✅ Documentation organization complete!"
echo "   Moved: $moved files"
echo ""
echo "📊 Remaining root markdown files:"
ls -1 *.md 2>/dev/null | wc -l || echo "0"
echo ""
