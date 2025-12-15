#!/bin/bash

echo "🔍 VALIDATING ENVIRONMENT CONFIGURATION"
echo "========================================"
echo ""

# Change to the app directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "   Run: cp .env.local.FIXED .env.local"
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Check for required variables
echo "📋 CHECKING REQUIRED VARIABLES:"
echo "--------------------------------"

check_var() {
    local var_name=$1
    local value=$(grep "^${var_name}=" .env.local | cut -d'=' -f2-)
    
    if [ -z "$value" ]; then
        echo "❌ $var_name: NOT SET"
        return 1
    elif [[ "$value" == *"your_"* ]] || [[ "$value" == *"_here"* ]]; then
        echo "⚠️  $var_name: PLACEHOLDER (needs real value)"
        return 2
    else
        # Mask the value for security
        local masked="${value:0:10}...${value: -4}"
        echo "✅ $var_name: SET ($masked)"
        return 0
    fi
}

# Required variables
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"
supabase_status=$?

check_var "OPENAI_API_KEY"
openai_status=$?

check_var "PINECONE_API_KEY"
pinecone_status=$?

check_var "PINECONE_INDEX_NAME"

echo ""
echo "📋 CHECKING OPTIONAL VARIABLES:"
echo "--------------------------------"

check_var "API_GATEWAY_URL"
check_var "PYTHON_AI_ENGINE_URL"

# Check if Redis is configured
if grep -q "^REDIS_URL=" .env.local; then
    check_var "REDIS_URL"
    echo "   ℹ️  Redis is ENABLED"
else
    echo "ℹ️  REDIS_URL: COMMENTED OUT (disabled)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
if [ $supabase_status -eq 2 ] || [ $openai_status -eq 2 ] || [ $pinecone_status -eq 2 ]; then
    echo "⚠️  CONFIGURATION INCOMPLETE"
    echo ""
    echo "You have placeholder values. Please update these variables in .env.local:"
    echo ""
    [ $supabase_status -eq 2 ] && echo "  • SUPABASE_SERVICE_ROLE_KEY"
    [ $openai_status -eq 2 ] && echo "  • OPENAI_API_KEY"
    [ $pinecone_status -eq 2 ] && echo "  • PINECONE_API_KEY"
    echo ""
    echo "Get your keys from:"
    echo "  → Supabase: https://supabase.com/dashboard"
    echo "  → OpenAI: https://platform.openai.com/api-keys"
    echo "  → Pinecone: https://app.pinecone.io"
    echo ""
elif [ $supabase_status -eq 0 ] && [ $openai_status -eq 0 ] && [ $pinecone_status -eq 0 ]; then
    echo "✅ CONFIGURATION COMPLETE!"
    echo ""
    echo "All required API keys are set. You can now run:"
    echo "  npm run dev"
    echo ""
else
    echo "❌ CONFIGURATION ERROR"
    echo ""
    echo "Some required variables are missing. Please check .env.local"
    echo ""
fi

