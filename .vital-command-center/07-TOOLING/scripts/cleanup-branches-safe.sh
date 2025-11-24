#!/bin/bash
# =====================================================================================
# SAFE BRANCH CLEANUP - KEEP ONLY MAIN AND DEV
# =====================================================================================
# This script safely deletes all branches except main and dev
# Handles divergent branches by resetting local main to match remote
# =====================================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${BLUE}SAFE GIT BRANCH CLEANUP${NC}"
echo -e "${BLUE}=====================================================================================${NC}"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# =====================================================================================
# STEP 1: Fetch latest from remote
# =====================================================================================
echo -e "${GREEN}[1/7] Fetching latest from remote...${NC}"
git fetch origin --prune
echo -e "${GREEN}✓ Fetched${NC}"

# =====================================================================================
# STEP 2: Check if dev exists, create if needed
# =====================================================================================
echo ""
echo -e "${GREEN}[2/7] Ensuring dev branch exists...${NC}"

if git ls-remote --heads origin dev | grep -q dev; then
    echo -e "${GREEN}✓ Remote dev exists${NC}"
    if ! git show-ref --verify --quiet refs/heads/dev; then
        git checkout -b dev origin/dev
    fi
else
    echo -e "${YELLOW}Creating dev branch from origin/main...${NC}"
    git checkout -b dev origin/main
    git push -u origin dev
    echo -e "${GREEN}✓ Created dev branch${NC}"
fi

# =====================================================================================
# STEP 3: Reset local main to match origin/main
# =====================================================================================
echo ""
echo -e "${GREEN}[3/7] Resetting local main to match origin/main...${NC}"
git checkout main
git reset --hard origin/main
echo -e "${GREEN}✓ Local main now matches remote${NC}"

# =====================================================================================
# STEP 4: Show branches to delete
# =====================================================================================
echo ""
echo -e "${BLUE}[4/7] Branches to be deleted:${NC}"
echo ""
echo -e "${YELLOW}Local branches ($(git branch | grep -v "main" | grep -v "dev" | wc -l | tr -d ' ')):${NC}"
git branch | grep -v "main" | grep -v "dev" || echo "  (none)"

echo ""
echo -e "${YELLOW}Remote branches ($(git branch -r | grep -v "main" | grep -v "dev" | grep -v "HEAD" | wc -l | tr -d ' ')):${NC}"
git branch -r | grep -v "main" | grep -v "dev" | grep -v "HEAD" || echo "  (none)"

echo ""
echo -e "${RED}⚠️  This will permanently delete all branches except main and dev${NC}"
read -p "Continue? (yes/no): " -r
if [[ ! $REPLY == "yes" ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 1
fi

# =====================================================================================
# STEP 5: Delete local branches
# =====================================================================================
echo ""
echo -e "${GREEN}[5/7] Deleting local branches...${NC}"

DELETED=0
for branch in $(git branch | grep -v "main" | grep -v "dev" | sed 's/^[ *]*//'); do
    if [ ! -z "$branch" ]; then
        echo -e "  ${RED}✗${NC} $branch"
        git branch -D "$branch" 2>/dev/null || true
        ((DELETED++))
    fi
done

echo -e "${GREEN}✓ Deleted $DELETED local branches${NC}"

# =====================================================================================
# STEP 6: Delete remote branches
# =====================================================================================
echo ""
echo -e "${GREEN}[6/7] Deleting remote branches...${NC}"

DELETED=0
for branch in $(git branch -r | grep -v "main" | grep -v "dev" | grep -v "HEAD" | sed 's/origin\///' | sed 's/^[ ]*//'); do
    if [ ! -z "$branch" ]; then
        echo -e "  ${RED}✗${NC} origin/$branch"
        git push origin --delete "$branch" 2>/dev/null || true
        ((DELETED++))
    fi
done

echo -e "${GREEN}✓ Deleted $DELETED remote branches${NC}"

# =====================================================================================
# STEP 7: Cleanup and verify
# =====================================================================================
echo ""
echo -e "${GREEN}[7/7] Cleaning up and verifying...${NC}"
git fetch --prune origin
git remote prune origin
echo -e "${GREEN}✓ Cleanup complete${NC}"

# =====================================================================================
# SUMMARY
# =====================================================================================
echo ""
echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${GREEN}✅ CLEANUP COMPLETE${NC}"
echo -e "${BLUE}=====================================================================================${NC}"
echo ""
echo -e "${BLUE}Remaining branches:${NC}"
echo ""
echo -e "${YELLOW}Local:${NC}"
git branch
echo ""
echo -e "${YELLOW}Remote:${NC}"
git branch -r
echo ""
echo -e "${GREEN}Current branch: $(git rev-parse --abbrev-ref HEAD)${NC}"
echo ""
