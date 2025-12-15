#!/bin/bash

echo "🔧 Creating user_agents table..."

# Read the SQL file and execute it
SQL_CONTENT=$(cat apps/digital-health-startup/database/migrations/005_create_user_agents_table.sql)

# Use a simpler approach - create the table directly
curl -X POST "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID/sql" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"CREATE TABLE IF NOT EXISTS public.user_agents (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL, agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(user_id, agent_id));\"
  }"

echo ""
echo "✅ user_agents table created!"
