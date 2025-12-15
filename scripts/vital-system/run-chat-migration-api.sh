#!/bin/bash

echo "🗄️ Running Chat Management Database Migration via Supabase API"
echo "=============================================================="

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo ""
echo "📋 Migration Details:"
echo "• Creating chat_sessions table"
echo "• Creating chat_messages table"
echo "• Setting up indexes and RLS policies"
echo "• Adding triggers for automatic updates"

echo ""
echo "🔧 Running migration via Supabase API..."

# Read the SQL file
SQL_CONTENT=$(cat database/migrations/006_chat_management_schema.sql)

# Execute via Supabase API
curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL_CONTENT\"}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 New Tables Created:"
    echo "• chat_sessions - Stores chat session metadata"
    echo "• chat_messages - Stores individual chat messages"
    echo ""
    echo "🔒 Security Features:"
    echo "• Row Level Security (RLS) enabled"
    echo "• User-specific data access policies"
    echo "• Automatic session updates on message creation"
    echo ""
    echo "🎯 Ready for Chat History Integration!"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi
