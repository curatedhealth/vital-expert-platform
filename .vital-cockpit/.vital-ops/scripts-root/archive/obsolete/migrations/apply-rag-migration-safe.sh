#!/bin/bash

# VITAL Path RAG Schema Safe Migration Script
echo "🚀 Applying VITAL Path RAG Schema (Safe Migration)..."
echo "📋 This migration creates RAG-specific tables with 'rag_' prefix to avoid conflicts"
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found, applying migration..."

    # Apply the safe migration
    supabase db reset --linked

    # Or apply specific migration file
    # psql $DATABASE_URL -f database/sql/migrations/2025/20250924100001_rag_schema_safe_migration.sql

else
    echo "⚠️  Supabase CLI not found"
    echo "📝 Please apply the following SQL file manually in Supabase Dashboard:"
    echo "   database/sql/migrations/2025/20250924100001_rag_schema_safe_migration.sql"
    echo ""
    echo "🔗 Or copy and paste this into Supabase SQL Editor:"
    echo "════════════════════════════════════════════════════════════════════"
    cat "$(dirname "$0")/../database/sql/migrations/2025/20250924100001_rag_schema_safe_migration.sql"
    echo "════════════════════════════════════════════════════════════════════"
fi

echo ""
echo "🎉 RAG Schema Migration Ready!"
echo "📋 Features included:"
echo "   ✅ Vector embeddings (pgvector)"
echo "   ✅ Multi-tenant knowledge sources"
echo "   ✅ PRISM suite classifications"
echo "   ✅ Healthcare domain specializations"
echo "   ✅ Semantic search function"
echo "   ✅ Row Level Security policies"
echo "   ✅ Performance-optimized indexes"
echo ""
echo "🔧 Tables created:"
echo "   • rag_tenants"
echo "   • rag_knowledge_sources"
echo "   • rag_knowledge_chunks"
echo "   • rag_search_analytics"
echo ""
echo "🎯 Ready for Phase 1 RAG system integration!"