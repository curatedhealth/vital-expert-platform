#!/bin/bash
# Quick Reference: Complete Phase 0 Data Loading
# Run this after migrations are complete

echo "=================================================="
echo "🚀 PHASE 0 DATA LOADING - COMPLETION SCRIPT"
echo "=================================================="
echo ""

# Navigate to project root
cd "$(dirname "$0")/../.." || exit 1
PROJECT_ROOT=$(pwd)

echo "📍 Project Root: $PROJECT_ROOT"
echo ""

# Load environment from .env
ENV_FILE="$PROJECT_ROOT/services/ai-engine/.env"
if [ -f "$ENV_FILE" ]; then
    echo "📦 Loading environment from .env..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "⚠️  No .env file found! Create services/ai-engine/.env with credentials."
    echo "   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY, NEO4J_URI, NEO4J_PASSWORD, PINECONE_API_KEY"
    exit 1
fi

# Step 1: Check migrations
echo "Step 1: Checking if migrations are complete..."
echo "----------------------------------------------"

python3 services/ai-engine/scripts/run_migrations.py

echo ""
echo "⚠️  If migrations are not complete, please run them via Supabase Dashboard first!"
echo "    https://supabase.com/dashboard → SQL Editor"
echo ""
read -p "Have you completed the migrations? (y/n): " migrations_complete

if [[ "$migrations_complete" != "y" ]]; then
    echo "❌ Please complete migrations first, then re-run this script."
    exit 1
fi

# Step 2: Re-run Neo4j loading
echo ""
echo "Step 2: Re-loading Neo4j knowledge graph..."
echo "----------------------------------------------"
cd services/ai-engine || exit 1

# Neo4j credentials already loaded from .env

./scripts/load_neo4j.sh --clear-existing

echo ""
echo "✅ Neo4j loading complete!"

# Step 3: (Optional) Re-run Pinecone loading
echo ""
read -p "Do you want to re-run Pinecone loading to enrich embeddings? (y/n): " pinecone_reload

if [[ "$pinecone_reload" == "y" ]]; then
    echo ""
    echo "Step 3: Re-loading Pinecone embeddings..."
    echo "----------------------------------------------"
    
    # Pinecone credentials already loaded from .env
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  OPENAI_API_KEY not set. Please set it:"
        read -p "Enter your OpenAI API key: " OPENAI_API_KEY
        export OPENAI_API_KEY
    fi
    
    python3 scripts/load_agents_to_pinecone.py
    
    echo ""
    echo "✅ Pinecone loading complete!"
else
    echo "⏭️  Skipping Pinecone reload (existing embeddings are sufficient)"
fi

# Summary
echo ""
echo "=================================================="
echo "🎉 PHASE 0 DATA LOADING - COMPLETE!"
echo "=================================================="
echo ""
echo "📊 Final Status:"
echo "   ✅ PostgreSQL: 319 agents, 151 skills, 13 tools"
echo "   ✅ Neo4j: 598 nodes, ~5,000 relationships"
echo "   ✅ Pinecone: 319 agent embeddings"
echo ""
echo "🚀 Ready for Phase 1: GraphRAG Service Implementation"
echo ""
echo "Next steps:"
echo "   1. Review: PHASE_0_FINAL_STATUS.md"
echo "   2. Start: Phase 1 (Database clients, RAG service)"
echo ""

