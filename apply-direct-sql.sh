#!/bin/bash

# Apply SQL directly to Supabase database
# This bypasses migration conflicts

set -e

echo "🚀 Applying SQL directly to Supabase database"
echo "============================================="

# Get the database URL from Supabase status
echo "Getting database connection details..."
supabase status --linked

echo ""
echo "Please run the following SQL commands in your Supabase SQL Editor:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of the following files:"
echo "   - supabase/migrations/20251008000004_complete_cloud_migration.sql"
echo "   - supabase/migrations/20251008000005_seed_agents.sql"
echo "   - supabase/migrations/20251008000006_clean_policies.sql"
echo ""
echo "Or run this command to get the database URL for direct connection:"
echo "supabase status --linked | grep 'Database URL'"

echo ""
echo "Alternative: Use psql to connect directly"
echo "========================================="
echo "You can also connect directly using psql:"
echo "psql 'your-database-url-here' -f supabase/migrations/20251008000004_complete_cloud_migration.sql"
echo "psql 'your-database-url-here' -f supabase/migrations/20251008000005_seed_agents.sql"
echo "psql 'your-database-url-here' -f supabase/migrations/20251008000006_clean_policies.sql"
