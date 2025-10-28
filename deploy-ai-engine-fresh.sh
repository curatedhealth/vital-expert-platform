#!/bin/bash
set -e

echo "🚀 VITAL AI Engine - Fresh Railway Deployment"
echo "=============================================="
echo ""

# Navigate to AI Engine directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

echo "📂 Current directory: $(pwd)"
echo ""

# Step 1: Initialize new Railway project
echo "Step 1: Creating new Railway project..."
railway init

echo ""
echo "Step 2: Setting environment variables..."
railway variables set \
  OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE" \
  SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes" \
  PINECONE_API_KEY="pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR" \
  PINECONE_INDEX_NAME="vital-knowledge" \
  GEMINI_API_KEY="AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0" \
  ENVIRONMENT="production" \
  LOG_LEVEL="info"

echo ""
echo "✅ Environment variables set!"
echo ""

echo "Step 3: Deploying to Railway..."
echo "This will take 3-5 minutes (building Docker image and installing packages)..."
railway up

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Get service URL: railway domain"
echo "2. Test health: curl https://[your-url].up.railway.app/health"
echo "3. View logs: railway logs"
