#!/bin/bash
# Quick Railway Deployment Script for VITAL AI Engine
# This script helps you deploy to Railway quickly

set -e

echo "🚀 VITAL AI Engine - Railway Quick Deploy"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "📦 Install it with: npm i -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Not logged in to Railway"
    echo "🔑 Running: railway login"
    railway login
fi

echo "✅ Logged in to Railway"
echo ""

# Check if project is initialized
if [ ! -f ".railway.json" ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

echo "✅ Railway project initialized"
echo ""

# Check required environment variables
echo "🔍 Checking required environment variables..."
echo ""

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
    "PINECONE_API_KEY"
    "PINECONE_INDEX_NAME"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! railway variables get "$var" &> /dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "⚠️  Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📝 Set them with:"
    echo "   railway variables set VARIABLE_NAME=value"
    echo ""
    echo "Or set them in Railway dashboard:"
    echo "   https://railway.app/dashboard"
    echo ""
    read -p "Continue with deployment anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ All required environment variables are set"
fi

echo ""
echo "🚀 Deploying to Railway..."
echo ""

# Deploy
railway up

echo ""
echo "✅ Deployment complete!"
echo ""

# Get deployment URL
echo "🔗 Getting deployment URL..."
URL=$(railway domain 2>/dev/null | grep -o 'https://[^ ]*' | head -1)

if [ -n "$URL" ]; then
    echo ""
    echo "🎉 Deployment URL: $URL"
    echo ""
    echo "📝 Add this to your local .env files:"
    echo "   AI_ENGINE_URL=$URL"
    echo "   NEXT_PUBLIC_AI_ENGINE_URL=$URL"
    echo ""
    echo "🧪 Test health endpoint:"
    echo "   curl $URL/health"
    echo ""
else
    echo "⚠️  Could not get deployment URL"
    echo "   Run: railway domain"
fi

echo ""
echo "✨ Done! Your Python AI Engine is deployed."
echo ""

