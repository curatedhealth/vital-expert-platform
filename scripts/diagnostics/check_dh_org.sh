#!/bin/bash
# ============================================================================
# Check if Digital Health Startup Tenant has Organizational Structure
# ============================================================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Checking Digital Health Tenant Org Structure"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create a .env file with your Supabase credentials:"
    echo "  SUPABASE_URL=your_supabase_url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check if required variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env${NC}"
    exit 1
fi

# Extract database connection info from Supabase URL
# Format: https://[project-ref].supabase.co
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')

echo "Connecting to Supabase project: $PROJECT_REF"
echo ""

# Use psql if available, otherwise use Supabase SQL Editor instructions
if command -v psql &> /dev/null; then
    # Connection string format for Supabase:
    # postgres://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
    
    # Prompt for database password
    echo -e "${YELLOW}Enter your Supabase database password:${NC}"
    read -s DB_PASSWORD
    echo ""
    
    # Run the query
    PGPASSWORD=$DB_PASSWORD psql \
        "postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
        -f check_digital_health_org.sql
    
    echo ""
    echo -e "${GREEN}Query completed!${NC}"
else
    echo -e "${YELLOW}psql not found. Please run the query manually:${NC}"
    echo ""
    echo "1. Open Supabase Dashboard"
    echo "2. Go to SQL Editor"
    echo "3. Copy and paste the contents of: check_digital_health_org.sql"
    echo "4. Run the query"
    echo ""
    echo "Or install PostgreSQL client:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql-client"
fi

