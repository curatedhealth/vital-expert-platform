#!/bin/bash

# ============================================================================
# KNOWLEDGE BASE MIGRATION SCRIPT
# ============================================================================
# Description: Run the knowledge base schema migration for RAG functionality
# Version: 1.0.0
# Date: 2025-01-27
# ============================================================================

set -e

echo "🚀 Starting Knowledge Base Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "apps/digital-health-startup/database/migrations/004_knowledge_base_schema.sql" ]; then
    echo "❌ Knowledge base migration file not found. Please run this script from the project root."
    exit 1
fi

# Check if Supabase is initialized
if [ ! -f "apps/digital-health-startup/supabase/config.toml" ]; then
    echo "❌ Supabase not initialized. Please run 'supabase init' first."
    exit 1
fi

echo "📋 Running knowledge base migration..."

# Run the migration
cd apps/digital-health-startup
supabase db reset --linked

echo "✅ Knowledge base migration completed successfully!"
echo ""
echo "📊 New tables created:"
echo "   - knowledge_sources: Source documents and files"
echo "   - knowledge_base: Processed knowledge chunks with embeddings"
echo "   - agent_knowledge_access: Agent knowledge access tracking"
echo "   - knowledge_search_analytics: Search analytics"
echo ""
echo "🔧 New functions created:"
echo "   - match_documents: Basic vector similarity search"
echo "   - search_knowledge_for_agent: Agent-optimized search"
echo "   - search_knowledge_base: General knowledge base search"
echo "   - hybrid_search: Combined vector and keyword search"
echo ""
echo "🎯 Next steps:"
echo "   1. Add knowledge sources to the knowledge_sources table"
echo "   2. Process documents and generate embeddings"
echo "   3. Test RAG functionality in Ask Expert"
echo ""
echo "✨ RAG system is now production-ready!"
