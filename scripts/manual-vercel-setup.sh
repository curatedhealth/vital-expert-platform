#!/bin/bash

# VITAL Expert - Manual Vercel Environment Variables Setup
# This script provides the exact commands to add environment variables to Vercel

echo "🚀 VITAL Expert - Manual Vercel Environment Variables Setup"
echo "=========================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

echo "📋 Manual Setup Commands:"
echo "========================="
echo ""
echo "Copy and run these commands one by one:"
echo ""

echo "# Required Variables:"
echo "echo 'your_supabase_service_role_key_here' | vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "echo 'your_openai_api_key_here' | vercel env add OPENAI_API_KEY production"
echo ""

echo "# Optional - Redis Caching (Recommended):"
echo "echo 'https://your-database.upstash.io' | vercel env add UPSTASH_REDIS_REST_URL production"
echo "echo 'your_rest_token_here' | vercel env add UPSTASH_REDIS_REST_TOKEN production"
echo ""

echo "# Optional - LangSmith Monitoring (Recommended):"
echo "echo 'true' | vercel env add LANGCHAIN_TRACING_V2 production"
echo "echo 'lsv2_your_langsmith_api_key_here' | vercel env add LANGCHAIN_API_KEY production"
echo "echo 'vital-path-production' | vercel env add LANGCHAIN_PROJECT production"
echo ""

echo "🔑 API Keys Needed:"
echo "==================="
echo ""
echo "1. Supabase Service Role Key:"
echo "   https://supabase.com/dashboard → Settings → API → service_role key"
echo ""
echo "2. OpenAI API Key:"
echo "   https://platform.openai.com/api-keys"
echo ""
echo "3. Upstash Redis (Optional):"
echo "   https://console.upstash.com/ → Create Database → Copy REST URL & Token"
echo ""
echo "4. LangSmith API Key (Optional):"
echo "   https://smith.langchain.com/ → Settings → API Keys"
echo ""

echo "✅ After adding variables:"
echo "========================="
echo ""
echo "1. Deploy: vercel --prod"
echo "2. Test: curl https://your-app.vercel.app/api/health"
echo "3. Check monitoring dashboards"
echo ""

echo "📚 Full guides:"
echo "• QUICK_ENV_SETUP.md"
echo "• VERCEL_ENV_SETUP_GUIDE.md"
echo "• OPTIONAL_FEATURES_SETUP.md"
