#!/bin/bash
# =====================================================================================
# CLEANUP GIT BRANCHES - KEEP ONLY MAIN AND DEV
# =====================================================================================
# This script deletes all branches except main and dev (both local and remote)
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
echo -e "${BLUE}GIT BRANCH CLEANUP - KEEP ONLY MAIN AND DEV${NC}"
echo -e "${BLUE}=====================================================================================${NC}"

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# =====================================================================================
# STEP 1: Show branches that will be deleted
# =====================================================================================
echo -e "${BLUE}[STEP 1] Branches to be deleted:${NC}"
echo ""

echo -e "${YELLOW}Local branches:${NC}"
git branch | grep -v "main" | grep -v "dev" | grep -v "^\*" || echo "  (none)"

echo ""
echo -e "${YELLOW}Remote branches:${NC}"
git branch -r | grep -v "main" | grep -v "dev" | grep -v "HEAD" | sed 's/origin\///' || echo "  (none)"

echo ""
echo -e "${RED}⚠️  WARNING: This action cannot be undone!${NC}"
echo -e "${RED}⚠️  All branches except 'main' and 'dev' will be permanently deleted.${NC}"
echo ""
read -p "Are you ABSOLUTELY sure you want to continue? (type 'yes' to confirm): " -r
echo
if [[ ! $REPLY == "yes" ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# =====================================================================================
# STEP 2: Create dev branch if it doesn't exist
# =====================================================================================
echo ""
echo -e "${GREEN}[STEP 2] Ensuring dev branch exists...${NC}"

# Check if dev exists locally
if git show-ref --verify --quiet refs/heads/dev; then
    echo -e "${GREEN}✓ Local dev branch exists${NC}"
else
    echo -e "${YELLOW}Creating local dev branch from main...${NC}"
    git checkout main
    git pull origin main
    git checkout -b dev
    echo -e "${GREEN}✓ Created local dev branch${NC}"
fi

# Check if dev exists remotely
if git ls-remote --heads origin dev | grep -q dev; then
    echo -e "${GREEN}✓ Remote dev branch exists${NC}"
else
    echo -e "${YELLOW}Pushing dev branch to remote...${NC}"
    git push -u origin dev
    echo -e "${GREEN}✓ Pushed dev branch to remote${NC}"
fi

# =====================================================================================
# STEP 3: Switch to main branch (safe base)
# =====================================================================================
echo ""
echo -e "${GREEN}[STEP 3] Switching to main branch...${NC}"
git checkout main
git pull origin main
echo -e "${GREEN}✓ On main branch${NC}"

# =====================================================================================
# STEP 4: Delete local branches
# =====================================================================================
echo ""
echo -e "${GREEN}[STEP 4] Deleting local branches...${NC}"

LOCAL_BRANCHES=$(git branch | grep -v "main" | grep -v "dev" | grep -v "^\*" | sed 's/^[ *]*//' || true)

if [ -z "$LOCAL_BRANCHES" ]; then
    echo -e "${YELLOW}No local branches to delete${NC}"
else
    DELETED_COUNT=0
    while IFS= read -r branch; do
        if [ ! -z "$branch" ]; then
            echo -e "  Deleting: ${RED}${branch}${NC}"
            git branch -D "$branch" 2>/dev/null || true
            ((DELETED_COUNT++))
        fi
    done <<< "$LOCAL_BRANCHES"
    echo -e "${GREEN}✓ Deleted ${DELETED_COUNT} local branches${NC}"
fi

# =====================================================================================
# STEP 5: Delete remote branches
# =====================================================================================
echo ""
echo -e "${GREEN}[STEP 5] Deleting remote branches...${NC}"

REMOTE_BRANCHES=$(git branch -r | grep -v "main" | grep -v "dev" | grep -v "HEAD" | sed 's/origin\///' | sed 's/^[ ]*//' || true)

if [ -z "$REMOTE_BRANCHES" ]; then
    echo -e "${YELLOW}No remote branches to delete${NC}"
else
    DELETED_COUNT=0
    while IFS= read -r branch; do
        if [ ! -z "$branch" ]; then
            echo -e "  Deleting remote: ${RED}origin/${branch}${NC}"
            git push origin --delete "$branch" 2>/dev/null || true
            ((DELETED_COUNT++))
        fi
    done <<< "$REMOTE_BRANCHES"
    echo -e "${GREEN}✓ Deleted ${DELETED_COUNT} remote branches${NC}"
fi

# =====================================================================================
# STEP 6: Cleanup stale remote references
# =====================================================================================
echo ""
echo -e "${GREEN}[STEP 6] Cleaning up stale remote references...${NC}"
git fetch --prune origin
git remote prune origin
echo -e "${GREEN}✓ Cleaned up stale references${NC}"

# =====================================================================================
# STEP 7: Verify cleanup
# =====================================================================================
echo ""
echo -e "${GREEN}[STEP 7] Verifying cleanup...${NC}"
echo ""
echo -e "${BLUE}Remaining local branches:${NC}"
git branch

echo ""
echo -e "${BLUE}Remaining remote branches:${NC}"
git branch -r

# =====================================================================================
# COMPLETE
# =====================================================================================
echo ""
echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${GREEN}✅ SUCCESS: Branch cleanup complete${NC}"
echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${GREEN}Remaining branches:${NC}"
echo -e "  Local:  main, dev"
echo -e "  Remote: origin/main, origin/dev"
echo ""
echo -e "${YELLOW}Current branch: $(git rev-parse --abbrev-ref HEAD)${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  - Verify branches: git branch -a"
echo -e "  - Switch to dev for development: git checkout dev"
echo -e "  - View branch history: git log --oneline --graph --all"
echo ""
