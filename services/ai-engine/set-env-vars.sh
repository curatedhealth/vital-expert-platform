#!/bin/bash
# Set all environment variables for Railway deployment

echo "🔧 Setting environment variables for Railway..."

cd "$(dirname "$0")"

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm i -g @railway/cli"
    exit 1
fi

# Check if service is linked
if ! railway status &> /dev/null; then
    echo "⚠️  No service linked. Run 'railway service' first to link/create a service"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Required variables (from ENVIRONMENT_SETUP.md)
echo "Setting required environment variables..."

railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
echo "✅ SUPABASE_URL set"

railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"
echo "✅ SUPABASE_ANON_KEY set"

railway variables --set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"
echo "✅ SUPABASE_SERVICE_ROLE_KEY set"

railway variables --set "PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR"
echo "✅ PINECONE_API_KEY set"

railway variables --set "PINECONE_INDEX_NAME=vital-knowledge"
echo "✅ PINECONE_INDEX_NAME set"

# Optional variables
railway variables --set "PORT=8000"
railway variables --set "LOG_LEVEL=info"
railway variables --set "EMBEDDING_PROVIDER=openai"

echo ""
echo "⚠️  IMPORTANT: You need to set OPENAI_API_KEY manually!"
echo "   Run: railway variables --set 'OPENAI_API_KEY=your-key-here'"
echo ""
echo "✅ Environment variables set!"
echo ""
echo "📋 Remaining steps:"
echo "   1. Set OPENAI_API_KEY (see above)"
echo "   2. Run: railway up (to deploy)"
echo "   3. Run: railway domain (to get URL)"
echo ""

