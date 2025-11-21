#!/bin/bash

# Run the user_agents table migration
echo "🔄 Running user_agents table migration..."

# Check if we're in the right directory
if [ ! -f "apps/digital-health-startup/database/migrations/002_user_agents_table.sql" ]; then
    echo "❌ Migration file not found. Please run this script from the project root."
    exit 1
fi

# Run the migration using psql (assuming you have PostgreSQL client installed)
# You may need to adjust the connection parameters based on your setup
echo "📝 Creating user_agents table..."

# Note: You'll need to replace these with your actual database connection details
# This is just a template - you should run this manually in your Supabase SQL editor
echo "⚠️  Please run the following SQL in your Supabase SQL editor:"
echo ""
cat apps/digital-health-startup/database/migrations/002_user_agents_table.sql
echo ""
echo "✅ Migration SQL ready to be executed in Supabase"
