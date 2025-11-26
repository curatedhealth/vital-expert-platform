#!/bin/bash
# Master script to execute Phase 2A enrichments
# Knowledge Domains, RAG Policies, and KG Views

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       Phase 2A: Knowledge Domains & RAG Setup                  ║"
echo "║       489 Medical Affairs Agents                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -d "services/ai-engine/scripts" ]; then
    echo "❌ Error: Must run from project root"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found"
    exit 1
fi

# Check for .env.local
ENV_FILE="/Users/hichamnaim/Downloads/Cursor/VITAL path/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env.local not found at $ENV_FILE"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Export environment variables
echo "🔧 Loading environment variables..."
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
export SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
echo "✅ Environment loaded"
echo ""

# Script directory
SCRIPT_DIR="services/ai-engine/scripts"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1/3: Knowledge Domains Enrichment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 "$SCRIPT_DIR/enrich_knowledge_domains.py"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Knowledge domains enrichment failed"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2/3: RAG Policies Enrichment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 "$SCRIPT_DIR/enrich_rag_policies.py"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ RAG policies enrichment failed"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3/3: KG Views Enrichment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 "$SCRIPT_DIR/enrich_kg_views.py"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ KG views enrichment failed"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  PHASE 2A COMPLETE! ✅                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ All 3 enrichments completed successfully:"
echo "   1. Knowledge Domains"
echo "   2. RAG Policies"
echo "   3. KG Views"
echo ""
echo "📊 Run verification:"
echo "   cd services/ai-engine"
echo "   python3 scripts/verify_phase2a_enrichment.py"
echo ""


