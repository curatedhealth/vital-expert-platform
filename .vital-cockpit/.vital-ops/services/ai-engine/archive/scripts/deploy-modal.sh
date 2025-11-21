#!/bin/bash
# Modal Deployment Script for VITAL AI Engine

set -e

echo "🚀 VITAL AI Engine - Modal Serverless Deployment"
echo "=================================================="
echo ""

# Check if Modal is installed
if ! command -v modal &> /dev/null; then
    echo "❌ Modal is not installed"
    echo "📦 Installing Modal..."
    pip install modal
fi

echo "✅ Modal is installed"
echo ""

# Check if authenticated
if ! modal app list &> /dev/null; then
    echo "⚠️  Modal is not authenticated"
    echo ""
    echo "🔐 Please run authentication:"
    echo "   modal setup"
    echo ""
    echo "This will:"
    echo "  1. Open your browser"
    echo "  2. Ask you to sign in with GitHub"
    echo "  3. Configure local credentials"
    echo ""
    echo "After authentication, run this script again:"
    echo "   ./deploy-modal.sh"
    exit 1
fi

echo "✅ Modal is authenticated"
echo ""

# Check if secrets exist
echo "📋 Checking secrets..."
if modal secret list 2>&1 | grep -q "vital-ai-engine-secrets"; then
    echo "✅ Secret 'vital-ai-engine-secrets' exists"
else
    echo "⚠️  Secret 'vital-ai-engine-secrets' not found"
    echo ""
    echo "📝 Please create secrets:"
    echo "   1. Go to: https://modal.com/secrets"
    echo "   2. Create secret: vital-ai-engine-secrets"
    echo "   3. Add environment variables:"
    echo "      - SUPABASE_URL"
    echo "      - SUPABASE_ANON_KEY"
    echo "      - SUPABASE_SERVICE_ROLE_KEY"
    echo "      - DATABASE_URL"
    echo "      - OPENAI_API_KEY"
    echo "      - PINECONE_API_KEY"
    echo "      - PINECONE_INDEX_NAME"
    echo ""
    echo "After creating secrets, run this script again:"
    echo "   ./deploy-modal.sh"
    exit 1
fi

echo ""
echo "🚀 Deploying to Modal..."
echo ""

# Deploy to Modal
cd "$(dirname "$0")"
modal deploy modal_deploy.py

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Test health endpoint (URL shown above)"
echo "   2. Update frontend .env.local files with Modal URL"
echo "   3. Monitor in Modal dashboard: https://modal.com/apps/vital-ai-engine"

