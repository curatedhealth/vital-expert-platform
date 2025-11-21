#!/bin/bash

echo "🗄️ Running Chat Management Database Migration"
echo "=============================================="

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
echo "🔧 Migration SQL ready to run manually:"
echo ""
echo "Please run the following SQL in your Supabase dashboard:"
echo "========================================================"
echo ""
cat database/migrations/006_chat_management_schema.sql
echo ""
echo "========================================================"
echo ""
echo "✅ Migration script completed!"
echo "📝 Copy the SQL above and run it in your Supabase SQL editor"
echo "🌐 Supabase Dashboard: https://supabase.com/dashboard"
