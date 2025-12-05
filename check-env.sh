#!/bin/bash

# ============================================
# 🔍 Environment Variables Verification Script
# ============================================
# This script checks which environment variables are configured

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🔍 VITAL Path - Environment Variables Check             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
    echo "✅ Found .env.local"
elif [ -f .env ]; then
    source .env
    echo "✅ Found .env"
else
    echo "❌ No .env or .env.local file found!"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📊 CONFIGURATION STATUS                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local required=$2
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "required" ]; then
            echo "❌ $var_name - NOT SET (REQUIRED)"
        else
            echo "⚪ $var_name - Not set (optional)"
        fi
    else
        # Show first 10 chars only for security
        local masked="${var_value:0:10}..."
        if [ "$required" = "required" ]; then
            echo "✅ $var_name - SET (${masked})"
        else
            echo "✅ $var_name - SET (${masked})"
        fi
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🗄️  SUPABASE (Database & Auth)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "SUPABASE_URL" "required"
check_var "SUPABASE_ANON_KEY" "required"
check_var "SUPABASE_SERVICE_ROLE_KEY" "required"
check_var "NEXT_PUBLIC_SUPABASE_URL" "required"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "required"
check_var "NEW_SUPABASE_URL" "optional"
check_var "NEW_SUPABASE_SERVICE_KEY" "optional"
check_var "DATABASE_URL" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 LLM PROVIDERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "OPENAI_API_KEY" "required"
check_var "OPENAI_MODEL" "optional"
check_var "OPENAI_EMBEDDING_MODEL" "optional"
check_var "ANTHROPIC_API_KEY" "optional"
check_var "GOOGLE_API_KEY" "optional"
check_var "GEMINI_API_KEY" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎯 VECTOR DATABASE (RAG)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "PINECONE_API_KEY" "optional"
check_var "PINECONE_INDEX_NAME" "optional"
check_var "PINECONE_ENVIRONMENT" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 AI ENGINE & SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "PYTHON_AI_ENGINE_URL" "optional"
check_var "API_GATEWAY_URL" "optional"
check_var "NEXT_PUBLIC_API_GATEWAY_URL" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 WEB SEARCH & TOOLS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "TAVILY_API_KEY" "optional"
check_var "HUGGINGFACE_API_KEY" "optional"
check_var "HF_TOKEN" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 MONITORING & OBSERVABILITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "LANGFUSE_SECRET_KEY" "optional"
check_var "LANGFUSE_PUBLIC_KEY" "optional"
check_var "LANGCHAIN_API_KEY" "optional"
check_var "SENTRY_DSN" "optional"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  💾 CACHING & STORAGE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_var "REDIS_URL" "optional"
check_var "UPSTASH_REDIS_REST_URL" "optional"
check_var "NEO4J_URI" "optional"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                       📋 SUMMARY                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Count configured variables
required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "OPENAI_API_KEY")
configured=0
for var in "${required_vars[@]}"; do
    if [ ! -z "${!var}" ]; then
        ((configured++))
    fi
done

total_required=${#required_vars[@]}

if [ $configured -eq $total_required ]; then
    echo "✅ All required variables configured ($configured/$total_required)"
    echo ""
    echo "🎉 You're ready to:"
    echo "   • Use agents from Supabase"
    echo "   • Execute workflows with AI"
    echo "   • Test the Workflow Designer"
    echo "   • Get AI-powered responses"
else
    echo "⚠️  Missing required variables: $((total_required - configured))/$total_required configured"
    echo ""
    echo "❌ Missing variables:"
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "   • $var"
        fi
    done
    echo ""
    echo "📖 See ENV_SETUP_VISUAL_GUIDE.md for setup instructions"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""













