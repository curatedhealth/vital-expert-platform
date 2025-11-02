#!/bin/bash
# Quick validation helper script
# Makes it easy to validate seed files before execution

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if file argument provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <seed_file.sql>              # Validate single file"
    echo "  $0 2025/*_part2.sql             # Validate all Part 2 files"
    echo "  $0 2025/06_cd_001_*.sql         # Validate specific use case"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 2025/06_cd_001_endpoint_selection_part2.sql"
    echo "  $0 2025/07_cd_002_biomarker_validation_part2.sql"
    exit 1
fi

# Run validation
python3 "$SCRIPT_DIR/validate_seed_file.py" "$@"
EXIT_CODE=$?

# Print helpful message based on result
if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Validation passed! You can now safely run:${NC}"
    echo ""
    for file in "$@"; do
        if [[ $file == *.sql ]]; then
            echo -e "  ${GREEN}psql -U postgres -d digital_health -f $file${NC}"
        fi
    done
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Validation failed! Fix the errors above before running SQL.${NC}"
    echo ""
    echo -e "${YELLOW}📚 Helpful resources:${NC}"
    echo "  - Schema Reference: $SCRIPT_DIR/SEED_SCHEMA_REFERENCE.md"
    echo "  - Working Example: $SCRIPT_DIR/2025/06_cd_001_endpoint_selection_part2.sql"
    echo "  - Validation README: $SCRIPT_DIR/README_VALIDATION.md"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

exit $EXIT_CODE

