#!/bin/bash

echo "🗄️ VITAL Expert - Database Migration Helper"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "This script will help you apply the complete VITAL Expert database migration."
echo ""

# Check if migration file exists
if [ ! -f "supabase/migrations/20251007222509_complete_vital_schema.sql" ]; then
    print_warning "Migration file not found!"
    echo "Please ensure the migration file exists at:"
    echo "supabase/migrations/20251007222509_complete_vital_schema.sql"
    exit 1
fi

print_success "Migration file found!"

echo ""
print_info "Next steps:"
echo ""
echo "1. Go to your Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql"
echo ""
echo "2. Copy the migration content:"
echo "   cat supabase/migrations/20251007222509_complete_vital_schema.sql"
echo ""
echo "3. Paste and run the migration in Supabase SQL Editor"
echo ""
echo "4. After migration, seed the agents:"
echo "   cat restore-all-agents.sql"
echo ""
echo "5. Test your platform:"
echo "   https://vital-expert-qfd5gvdlp-crossroads-catalysts-projects.vercel.app/agents"
echo ""

# Show migration file size
MIGRATION_SIZE=$(wc -l < supabase/migrations/20251007222509_complete_vital_schema.sql)
print_info "Migration file contains $MIGRATION_SIZE lines"

echo ""
print_info "Would you like to see the migration content? (y/n)"
read -r show_content

if [ "$show_content" = "y" ] || [ "$show_content" = "Y" ]; then
    echo ""
    echo "📄 Migration Content:"
    echo "===================="
    cat supabase/migrations/20251007222509_complete_vital_schema.sql
fi

echo ""
print_success "Migration helper complete!"
print_info "Follow the steps above to apply the migration to your Supabase database."
