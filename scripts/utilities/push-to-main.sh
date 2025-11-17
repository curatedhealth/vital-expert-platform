#!/bin/bash
# =====================================================================================
# PUSH VITAL PLATFORM CODE TO MAIN BRANCH
# =====================================================================================
# This script stages and commits specific folders while excluding documentation
# Author: VITAL Platform Team
# Date: 2025-11-17
# =====================================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${BLUE}VITAL PLATFORM - PUSH TO MAIN BRANCH${NC}"
echo -e "${BLUE}=====================================================================================${NC}"

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"

# Confirm action
echo -e "${YELLOW}This will:${NC}"
echo -e "  1. Stage specific folders (apps, packages, services, database, scripts)"
echo -e "  2. Exclude all documentation except README files"
echo -e "  3. Commit changes"
echo -e "  4. Switch to main branch"
echo -e "  5. Merge changes"
echo -e "  6. Push to origin/main"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# =====================================================================================
# STEP 1: Stage Specific Folders
# =====================================================================================
echo -e "${GREEN}[1/6] Staging folders...${NC}"

# Add core application folders
git add apps/digital-health-startup/
git add packages/
git add services/ai-engine/
git add services/api-gateway/
git add services/shared-kernel/

# Add database migrations and scripts
git add database/
git add scripts/

# Add root configuration files
git add package.json
git add pnpm-lock.yaml
git add pnpm-workspace.yaml
git add turbo.json
git add .gitignore
git add README.md

echo -e "${GREEN}✓ Folders staged${NC}"

# =====================================================================================
# STEP 2: Unstage Documentation Files (Except READMEs)
# =====================================================================================
echo -e "${GREEN}[2/6] Excluding documentation files...${NC}"

# Unstage all .md files except README.md
git reset HEAD -- '*.md'
git add '**/README.md'
git add README.md

# Unstage documentation directories
git reset HEAD -- docs/ 2>/dev/null || true
git reset HEAD -- documentation/ 2>/dev/null || true
git reset HEAD -- archive/ 2>/dev/null || true
git reset HEAD -- backup/ 2>/dev/null || true
git reset HEAD -- deprecated/ 2>/dev/null || true

# Unstage specific doc patterns
git reset HEAD -- '**/*.mdx' 2>/dev/null || true
git reset HEAD -- '**/*.pdf' 2>/dev/null || true
git reset HEAD -- '**/*.docx' 2>/dev/null || true
git reset HEAD -- '**/DOCS.md' 2>/dev/null || true
git reset HEAD -- '**/DOCUMENTATION.md' 2>/dev/null || true
git reset HEAD -- '**/GUIDE.md' 2>/dev/null || true
git reset HEAD -- '**/NOTES.md' 2>/dev/null || true

echo -e "${GREEN}✓ Documentation files excluded${NC}"

# =====================================================================================
# STEP 3: Show What Will Be Committed
# =====================================================================================
echo -e "${GREEN}[3/6] Files to be committed:${NC}"
git status --short

echo ""
read -p "Proceed with commit? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted. Run 'git reset' to unstage files.${NC}"
    exit 1
fi

# =====================================================================================
# STEP 4: Create Commit
# =====================================================================================
echo -e "${GREEN}[4/6] Creating commit...${NC}"

COMMIT_MESSAGE="feat: comprehensive platform update with v3.0 schema

- Add comprehensive persona/JTBD database migration (24 tables)
- Update frontend applications and shared packages
- Enhance AI engine with LangGraph workflows
- Add production-ready scripts and utilities
- Implement RLS policies and database migrations

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git commit -m "$COMMIT_MESSAGE"

echo -e "${GREEN}✓ Commit created${NC}"

# =====================================================================================
# STEP 5: Switch to Main and Merge
# =====================================================================================
echo -e "${GREEN}[5/6] Switching to main branch...${NC}"

# Fetch latest main
git fetch origin main

# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Merge current branch
echo -e "${GREEN}Merging ${CURRENT_BRANCH} into main...${NC}"
git merge ${CURRENT_BRANCH} --no-ff -m "Merge branch '${CURRENT_BRANCH}' into main

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo -e "${GREEN}✓ Merged into main${NC}"

# =====================================================================================
# STEP 6: Push to Origin
# =====================================================================================
echo -e "${GREEN}[6/6] Pushing to origin/main...${NC}"

git push origin main

echo -e "${GREEN}✓ Pushed to origin/main${NC}"

# =====================================================================================
# COMPLETE
# =====================================================================================
echo ""
echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${GREEN}✅ SUCCESS: Code pushed to main branch${NC}"
echo -e "${BLUE}=====================================================================================${NC}"
echo -e "Branch: main"
echo -e "Remote: origin/main"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  - Verify deployment: git log --oneline -5"
echo -e "  - Switch back to feature branch: git checkout ${CURRENT_BRANCH}"
echo -e "  - Delete feature branch (optional): git branch -d ${CURRENT_BRANCH}"
echo ""
