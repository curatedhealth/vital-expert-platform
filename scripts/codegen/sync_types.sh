#!/bin/bash
# ============================================================================
# VITAL Path - Type Synchronization Script
# ============================================================================
#
# This script keeps TypeScript (Zod) and Python (Pydantic) types in sync.
#
# Flow:
#   1. Generate JSON Schemas from Zod (TypeScript)
#   2. Generate Pydantic models from JSON Schemas (Python)
#   3. Validate generated code compiles
#
# Usage:
#   ./scripts/codegen/sync_types.sh
#   OR
#   make sync-types
#
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  VITAL Path - Type Synchronization${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# ============================================================================
# Step 1: Generate JSON Schemas from Zod
# ============================================================================
echo -e "${YELLOW}📦 Step 1: Generating JSON Schemas from Protocol Package...${NC}"
cd "$ROOT_DIR/packages/protocol"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    pnpm install
fi

# Generate JSON schemas
pnpm run generate:json-schemas

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ JSON Schemas generated successfully${NC}"
else
    echo -e "${RED}  ❌ Failed to generate JSON Schemas${NC}"
    exit 1
fi

cd "$ROOT_DIR"
echo ""

# ============================================================================
# Step 2: Generate Pydantic Models from JSON Schemas
# ============================================================================
echo -e "${YELLOW}🐍 Step 2: Generating Pydantic Models...${NC}"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}  ❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if datamodel-code-generator is installed
if ! python3 -c "import datamodel_code_generator" &> /dev/null; then
    echo "  Installing datamodel-code-generator..."
    pip install datamodel-code-generator
fi

# Run the Python generator
python3 "$SCRIPT_DIR/generate_pydantic.py"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Pydantic models generated successfully${NC}"
else
    echo -e "${RED}  ❌ Failed to generate Pydantic models${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Step 3: Validate Generated Code
# ============================================================================
echo -e "${YELLOW}✅ Step 3: Validating generated code...${NC}"

# Validate TypeScript
echo "  Checking TypeScript..."
cd "$ROOT_DIR/packages/protocol"
pnpm run typecheck

if [ $? -eq 0 ]; then
    echo -e "${GREEN}    TypeScript: OK${NC}"
else
    echo -e "${RED}    TypeScript: FAILED${NC}"
    exit 1
fi

cd "$ROOT_DIR"

# Validate Python
echo "  Checking Python..."
cd "$ROOT_DIR/services/ai-engine"

# Check if the generated directory exists
if [ -d "src/api/schemas/_generated" ]; then
    # Try to import the generated models
    python3 -c "
import sys
sys.path.insert(0, 'src')
try:
    from api.schemas._generated import *
    print('    Python: OK')
except Exception as e:
    print(f'    Python: FAILED - {e}')
    sys.exit(1)
"
    if [ $? -ne 0 ]; then
        exit 1
    fi
else
    echo -e "${YELLOW}    Python: Skipped (no generated directory yet)${NC}"
fi

cd "$ROOT_DIR"
echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✨ Type synchronization complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Generated files:"
echo "  - packages/protocol/src/json-schemas/*.json"
echo "  - services/ai-engine/src/api/schemas/_generated/*.py"
echo ""
echo -e "${YELLOW}Remember: Never edit files in _generated/ directories!${NC}"


