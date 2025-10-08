#!/bin/bash

echo "🚀 VITAL Expert - CLI Migration Runner"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

print_success "Supabase CLI is available: $(supabase --version)"

# Check if we're linked to a project
if [ ! -f "supabase/.temp/project-ref" ]; then
    print_error "Not linked to a Supabase project. Please link first:"
    echo "   supabase link --project-ref xazinxsiglqokwfmogyk"
    exit 1
fi

print_success "Linked to Supabase project"

# Check if migration file exists
if [ ! -f "supabase/migrations/20251007222509_complete_vital_schema.sql" ]; then
    print_error "Migration file not found!"
    echo "Expected: supabase/migrations/20251007222509_complete_vital_schema.sql"
    exit 1
fi

print_success "Migration file found"

echo ""
print_info "To apply the migration via CLI, you need the database password."
echo ""
echo "Get your database password from:"
echo "https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/settings/database"
echo ""

read -p "Enter your database password: " -s db_password
echo ""

if [ -z "$db_password" ]; then
    print_error "Database password is required"
    exit 1
fi

echo ""
print_info "Applying migration to Supabase..."
echo ""

# Apply the migration
if supabase db push --password "$db_password"; then
    print_success "Migration applied successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Test your platform: https://vital-expert-qfd5gvdlp-crossroads-catalysts-projects.vercel.app/agents"
    echo "2. You should see 21+ agents in the dashboard"
    echo "3. Authentication should be working"
    echo ""
    print_success "Migration complete! 🎉"
else
    print_error "Migration failed. Please check the error messages above."
    echo ""
    print_info "Alternative approach:"
    echo "1. Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql"
    echo "2. Copy the migration content from: supabase/migrations/20251007222509_complete_vital_schema.sql"
    echo "3. Paste and run it manually"
    exit 1
fi
