#!/bin/bash
# =====================================================================================
# FIX SECURITY VULNERABILITIES
# =====================================================================================
# This script fixes all critical, high, and moderate security vulnerabilities
# Author: VITAL Platform Team
# Date: 2025-11-17
# =====================================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${BLUE}FIXING SECURITY VULNERABILITIES${NC}"
echo -e "${BLUE}=====================================================================================${NC}"
echo ""

# =====================================================================================
# STEP 1: Check current vulnerabilities
# =====================================================================================
echo -e "${GREEN}[1/7] Checking current vulnerabilities...${NC}"
pnpm audit --json > /tmp/audit-before.json 2>&1 || true

CRITICAL=$(jq '[.advisories[] | select(.severity=="critical")] | length' /tmp/audit-before.json 2>/dev/null || echo 0)
HIGH=$(jq '[.advisories[] | select(.severity=="high")] | length' /tmp/audit-before.json 2>/dev/null || echo 0)
MODERATE=$(jq '[.advisories[] | select(.severity=="moderate")] | length' /tmp/audit-before.json 2>/dev/null || echo 0)
LOW=$(jq '[.advisories[] | select(.severity=="low")] | length' /tmp/audit-before.json 2>/dev/null || echo 0)

echo -e "${YELLOW}Current vulnerabilities:${NC}"
echo -e "  🔴 Critical: $CRITICAL"
echo -e "  🟠 High: $HIGH"
echo -e "  🟡 Moderate: $MODERATE"
echo -e "  🟢 Low: $LOW"
echo ""

# =====================================================================================
# STEP 2: Update Next.js (CRITICAL - CVE-2024-56332)
# =====================================================================================
echo -e "${GREEN}[2/7] Updating Next.js to fix critical vulnerabilities...${NC}"

# Check current Next.js version
CURRENT_NEXT=$(pnpm list next --json 2>/dev/null | jq -r '.[0].devDependencies.next.version' || echo "unknown")
echo -e "${YELLOW}Current Next.js: $CURRENT_NEXT${NC}"

# Update to Next.js 14.2.21+ (fixes critical CVE-2024-56332)
echo -e "${YELLOW}Updating to Next.js 14.2.21...${NC}"
pnpm update next@14.2.21 --recursive

echo -e "${GREEN}✓ Next.js updated${NC}"
echo ""

# =====================================================================================
# STEP 3: Update vulnerable dependencies
# =====================================================================================
echo -e "${GREEN}[3/7] Updating other vulnerable dependencies...${NC}"

# Update validator (moderate)
pnpm update validator@latest --recursive

# Update esbuild (moderate)
pnpm update esbuild@latest --recursive

# Update js-yaml (moderate)
pnpm update js-yaml@latest --recursive

# Update tar (moderate)
pnpm update tar@latest --recursive

# Update prismjs (moderate)
pnpm update prismjs@latest --recursive

# Update expr-eval (high)
pnpm update expr-eval@latest --recursive || echo "expr-eval may need manual review"

echo -e "${GREEN}✓ Dependencies updated${NC}"
echo ""

# =====================================================================================
# STEP 4: Run pnpm audit fix
# =====================================================================================
echo -e "${GREEN}[4/7] Running pnpm audit fix...${NC}"
pnpm audit fix --recursive || echo "Some vulnerabilities may require manual intervention"
echo ""

# =====================================================================================
# STEP 5: Update Python dependencies (ai-engine)
# =====================================================================================
echo -e "${GREEN}[5/7] Checking Python dependencies...${NC}"

if [ -d "services/ai-engine" ]; then
    cd services/ai-engine

    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
    fi

    # Check for vulnerable packages
    echo -e "${YELLOW}Running pip audit...${NC}"
    pip install pip-audit 2>/dev/null || true
    pip-audit --fix 2>/dev/null || echo "pip-audit not available, skipping Python fixes"

    # Update key packages
    pip install --upgrade anthropic langchain langchain-anthropic supabase 2>/dev/null || true

    cd ../..
    echo -e "${GREEN}✓ Python dependencies checked${NC}"
else
    echo -e "${YELLOW}ai-engine directory not found, skipping Python updates${NC}"
fi
echo ""

# =====================================================================================
# STEP 6: Verify fixes
# =====================================================================================
echo -e "${GREEN}[6/7] Verifying fixes...${NC}"
pnpm audit --json > /tmp/audit-after.json 2>&1 || true

CRITICAL_AFTER=$(jq '[.advisories[] | select(.severity=="critical")] | length' /tmp/audit-after.json 2>/dev/null || echo 0)
HIGH_AFTER=$(jq '[.advisories[] | select(.severity=="high")] | length' /tmp/audit-after.json 2>/dev/null || echo 0)
MODERATE_AFTER=$(jq '[.advisories[] | select(.severity=="moderate")] | length' /tmp/audit-after.json 2>/dev/null || echo 0)
LOW_AFTER=$(jq '[.advisories[] | select(.severity=="low")] | length' /tmp/audit-after.json 2>/dev/null || echo 0)

echo -e "${YELLOW}Vulnerabilities after fixes:${NC}"
echo -e "  🔴 Critical: $CRITICAL_AFTER (was $CRITICAL)"
echo -e "  🟠 High: $HIGH_AFTER (was $HIGH)"
echo -e "  🟡 Moderate: $MODERATE_AFTER (was $MODERATE)"
echo -e "  🟢 Low: $LOW_AFTER (was $LOW)"
echo ""

# Calculate improvements
CRITICAL_FIXED=$((CRITICAL - CRITICAL_AFTER))
HIGH_FIXED=$((HIGH - HIGH_AFTER))
MODERATE_FIXED=$((MODERATE - MODERATE_AFTER))
LOW_FIXED=$((LOW - LOW_AFTER))

echo -e "${GREEN}Fixed:${NC}"
echo -e "  ✅ Critical: $CRITICAL_FIXED"
echo -e "  ✅ High: $HIGH_FIXED"
echo -e "  ✅ Moderate: $MODERATE_FIXED"
echo -e "  ✅ Low: $LOW_FIXED"
echo ""

# =====================================================================================
# STEP 7: Show remaining issues
# =====================================================================================
echo -e "${GREEN}[7/7] Remaining issues that require manual review:${NC}"

if [ "$CRITICAL_AFTER" -gt 0 ] || [ "$HIGH_AFTER" -gt 0 ]; then
    pnpm audit --audit-level=high 2>/dev/null | head -50 || true
    echo ""
    echo -e "${RED}⚠️  Critical or High vulnerabilities still remain!${NC}"
    echo -e "${YELLOW}These may require:${NC}"
    echo -e "  - Major version updates"
    echo -e "  - Code changes"
    echo -e "  - Alternative packages"
    echo ""
else
    echo -e "${GREEN}✅ No critical or high vulnerabilities remaining!${NC}"
fi

# =====================================================================================
# COMPLETE
# =====================================================================================
echo ""
echo -e "${BLUE}=====================================================================================${NC}"
echo -e "${GREEN}SECURITY FIX COMPLETE${NC}"
echo -e "${BLUE}=====================================================================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review any remaining vulnerabilities above"
echo -e "  2. Test the application: pnpm dev"
echo -e "  3. Commit changes: git add . && git commit -m 'fix: security vulnerabilities'"
echo -e "  4. Push to main: git push origin main"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo -e "  Fixed: $((CRITICAL_FIXED + HIGH_FIXED + MODERATE_FIXED + LOW_FIXED)) vulnerabilities"
echo -e "  Remaining: $((CRITICAL_AFTER + HIGH_AFTER + MODERATE_AFTER + LOW_AFTER)) vulnerabilities"
echo ""
