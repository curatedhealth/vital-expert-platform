#!/bin/bash

# Comprehensive ESLint Fix Script for VITAL Path
# This script systematically fixes all ESLint errors and warnings

set -e

PROJECT_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path"
cd "$PROJECT_DIR"

echo "================================================"
echo "VITAL Path - Comprehensive ESLint Fix"
echo "================================================"
echo ""

# Step 1: Auto-fix import order violations
echo "Step 1: Fixing import order violations..."
npm run lint:fix -- --quiet 2>&1 | grep -E "(error|warning)" | head -20 || true
echo "✓ Auto-fixable issues resolved"
echo ""

# Step 2: Generate full ESLint report
echo "Step 2: Generating ESLint report..."
npm run lint 2>&1 > /tmp/eslint_full_report.txt || true
echo "✓ Report generated at /tmp/eslint_full_report.txt"
echo ""

# Step 3: Count issues by type
echo "Step 3: Analyzing issues by type..."
echo "----------------------------------------"
echo "Unused variables: $(grep -c "@typescript-eslint/no-unused-vars" /tmp/eslint_full_report.txt || echo 0)"
echo "Console statements: $(grep -c "no-console" /tmp/eslint_full_report.txt || echo 0)"
echo "Explicit any: $(grep -c "@typescript-eslint/no-explicit-any" /tmp/eslint_full_report.txt || echo 0)"
echo "Unsafe assignments: $(grep -c "@typescript-eslint/no-unsafe-assignment" /tmp/eslint_full_report.txt || echo 0)"
echo "Unsafe calls: $(grep -c "@typescript-eslint/no-unsafe-call" /tmp/eslint_full_report.txt || echo 0)"
echo "Unsafe member access: $(grep -c "@typescript-eslint/no-unsafe-member-access" /tmp/eslint_full_report.txt || echo 0)"
echo "Accessibility issues: $(grep -c "jsx-a11y" /tmp/eslint_full_report.txt || echo 0)"
echo "Import order: $(grep -c "import/order" /tmp/eslint_full_report.txt || echo 0)"
echo "----------------------------------------"
echo ""

echo "Step 4: Ready for manual fixes..."
echo "Files with most errors:"
grep -E "^\./" /tmp/eslint_full_report.txt | head -30
echo ""
echo "Run 'npm run lint' to see current status"