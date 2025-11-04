#!/bin/bash

# VITAL Platform App - Vercel CLI Deployment
# Deploys to *.vital.expert

set -e

echo "🚀 VITAL Platform App - CLI Deployment"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Navigate to app directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

echo "✅ Step 1: Ensure logged in to Vercel"
vercel whoami || vercel login

echo ""
echo "✅ Step 2: Deploy Platform App"
echo "  Project: vital-platform-app"
echo "  Domains: *.vital.expert, app.vital.expert"
echo ""

# Deploy with all environment variables
vercel deploy \
  --name vital-platform-app \
  --prod \
  --yes \
  --env NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY \
  --env NEXT_PUBLIC_APP_URL=https://app.vital.expert \
  --env NODE_ENV=production \
  --env NEXT_PUBLIC_ENABLE_MULTI_TENANT=true \
  --env NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001 \
  --env NEXT_PUBLIC_ENABLE_ANALYTICS=true \
  --env NEXT_PUBLIC_ENABLE_DEBUG=false \
  --env SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes \
  --env OPENAI_API_KEY="${OPENAI_API_KEY:-YOUR_OPENAI_API_KEY_HERE}" \
  --env PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR \
  --env PINECONE_INDEX_NAME=vital-knowledge \
  --env GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0 \
  --env UPSTASH_REDIS_REST_URL=https://square-halibut-35639.upstash.io \
  --env UPSTASH_REDIS_REST_TOKEN=AYs3AAIncDE1Y2RmMGUwYmY1Mzk0YTU4OWFhNjAzMjk0MWVjYzhmM3AxMzU2Mzk \
  --env LANGFUSE_PUBLIC_KEY=b1fe4bae-221e-4c74-8e97-6bd73c0ab30e \
  --env LANGFUSE_HOST=https://cloud.langfuse.com

echo ""
echo "✅ Step 3: Add Custom Domains"
echo ""

# Add wildcard and app domains
vercel domains add "*.vital.expert" --scope crossroads-catalysts-projects
vercel domains add app.vital.expert --scope crossroads-catalysts-projects

echo ""
echo "🎉 Platform App Deployed!"
echo ""
echo "📍 Next Steps:"
echo "  1. Ensure DNS wildcard is configured:"
echo "     CNAME *  cname.vercel-dns.com"
echo ""
echo "  2. Test deployment:"
echo "     curl -I https://app.vital.expert"
echo "     curl -I https://acme.vital.expert"
echo ""
echo "  3. Connect to Railway backend (when ready)"
echo ""
