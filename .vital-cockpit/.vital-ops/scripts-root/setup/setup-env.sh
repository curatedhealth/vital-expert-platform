#!/bin/bash

# ============================================================================
# VITAL Expert Platform - Quick Environment Setup
# ============================================================================
# This script helps you set up the minimum required environment variables
# ============================================================================

set -e

ENV_FILE="apps/digital-health-startup/.env.local"

echo "🚀 VITAL Expert - Environment Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ -f "$ENV_FILE" ]; then
    echo "✅ Found existing $ENV_FILE"
    echo ""
    read -p "Do you want to ADD missing variables to the existing file? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
else
    echo "📝 Creating new $ENV_FILE"
    touch "$ENV_FILE"
fi

echo ""
echo "🔑 Let's set up your environment variables"
echo "=========================================="
echo ""

# Function to check if variable exists
variable_exists() {
    grep -q "^$1=" "$ENV_FILE" 2>/dev/null
}

# Function to add or update variable
add_variable() {
    local key=$1
    local value=$2
    
    if variable_exists "$key"; then
        echo "  ⏭️  $key already exists (skipping)"
    else
        echo "$key=$value" >> "$ENV_FILE"
        echo "  ✅ Added $key"
    fi
}

# 1. OpenAI API Key (REQUIRED)
echo "1️⃣  OpenAI API Key (REQUIRED for Ask Panel)"
echo "   Get it from: https://platform.openai.com/api-keys"
echo ""
if variable_exists "OPENAI_API_KEY"; then
    echo "  ✅ OPENAI_API_KEY already configured"
else
    read -p "   Enter your OpenAI API key (or press Enter to skip): " openai_key
    if [ -n "$openai_key" ]; then
        add_variable "OPENAI_API_KEY" "$openai_key"
    else
        echo "  ⚠️  Skipped - Ask Panel features will not work without this"
        add_variable "OPENAI_API_KEY" "sk-proj-your-key-here"
    fi
fi

echo ""
echo "2️⃣  Security Keys (Generate automatically)"
echo "   These are required for JWT, encryption, and CSRF protection"
echo ""

if ! variable_exists "JWT_SECRET"; then
    JWT_SECRET=$(openssl rand -base64 32)
    add_variable "JWT_SECRET" "$JWT_SECRET"
fi

if ! variable_exists "ENCRYPTION_KEY"; then
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    add_variable "ENCRYPTION_KEY" "$ENCRYPTION_KEY"
fi

if ! variable_exists "CSRF_SECRET"; then
    CSRF_SECRET=$(openssl rand -base64 32)
    add_variable "CSRF_SECRET" "$CSRF_SECRET"
fi

echo ""
echo "3️⃣  Supabase Configuration"
echo "   Get these from: https://supabase.com/dashboard/project/[project]/settings/api"
echo ""

if ! variable_exists "NEXT_PUBLIC_SUPABASE_URL"; then
    read -p "   Supabase URL (or press Enter to use placeholder): " supabase_url
    if [ -n "$supabase_url" ]; then
        add_variable "NEXT_PUBLIC_SUPABASE_URL" "$supabase_url"
    else
        add_variable "NEXT_PUBLIC_SUPABASE_URL" "https://your-project.supabase.co"
    fi
fi

if ! variable_exists "NEXT_PUBLIC_SUPABASE_ANON_KEY"; then
    read -p "   Supabase Anon Key (or press Enter to use placeholder): " supabase_anon
    if [ -n "$supabase_anon" ]; then
        add_variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$supabase_anon"
    else
        add_variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" "your-anon-key-here"
    fi
fi

if ! variable_exists "SUPABASE_SERVICE_ROLE_KEY"; then
    read -p "   Supabase Service Role Key (or press Enter to use placeholder): " supabase_service
    if [ -n "$supabase_service" ]; then
        add_variable "SUPABASE_SERVICE_ROLE_KEY" "$supabase_service"
    else
        add_variable "SUPABASE_SERVICE_ROLE_KEY" "your-service-role-key-here"
    fi
fi

echo ""
echo "4️⃣  Database & Redis"
echo ""

if ! variable_exists "DATABASE_URL"; then
    read -p "   Database URL (or press Enter to use placeholder): " db_url
    if [ -n "$db_url" ]; then
        add_variable "DATABASE_URL" "$db_url"
    else
        add_variable "DATABASE_URL" "postgresql://postgres:password@localhost:5432/vital"
    fi
fi

if ! variable_exists "REDIS_URL"; then
    read -p "   Redis URL [default: redis://localhost:6379]: " redis_url
    redis_url=${redis_url:-redis://localhost:6379}
    add_variable "REDIS_URL" "$redis_url"
fi

echo ""
echo "5️⃣  Optional: Additional LLM Providers"
echo "   (Press Enter to skip each one)"
echo ""

if ! variable_exists "ANTHROPIC_API_KEY"; then
    read -p "   Anthropic API Key (optional): " anthropic_key
    [ -n "$anthropic_key" ] && add_variable "ANTHROPIC_API_KEY" "$anthropic_key"
fi

if ! variable_exists "GOOGLE_API_KEY"; then
    read -p "   Google AI API Key (optional): " google_key
    [ -n "$google_key" ] && add_variable "GOOGLE_API_KEY" "$google_key"
fi

if ! variable_exists "GROQ_API_KEY"; then
    read -p "   Groq API Key (optional, FREE tier): " groq_key
    [ -n "$groq_key" ] && add_variable "GROQ_API_KEY" "$groq_key"
fi

echo ""
echo "6️⃣  Monitoring (Optional)"
echo ""

if ! variable_exists "NEXT_PUBLIC_SENTRY_DSN"; then
    read -p "   Sentry DSN (optional): " sentry_dsn
    [ -n "$sentry_dsn" ] && add_variable "NEXT_PUBLIC_SENTRY_DSN" "$sentry_dsn"
fi

echo ""
echo "============================================"
echo "✅ Environment Setup Complete!"
echo "============================================"
echo ""
echo "📝 Configuration saved to: $ENV_FILE"
echo ""
echo "🔍 Summary:"
grep -c "^OPENAI_API_KEY=sk-" "$ENV_FILE" > /dev/null && echo "  ✅ OpenAI API Key configured" || echo "  ⚠️  OpenAI API Key needs to be added"
grep -c "^JWT_SECRET=" "$ENV_FILE" > /dev/null && echo "  ✅ Security keys configured" || echo "  ❌ Security keys missing"
grep -c "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" > /dev/null && echo "  ✅ Supabase configuration present" || echo "  ⚠️  Supabase needs configuration"
echo ""
echo "🚀 Next Steps:"
echo "  1. Edit $ENV_FILE to add any missing real values"
echo "  2. Restart your dev server: pnpm dev"
echo "  3. Test the Ask Panel feature"
echo ""
echo "📚 For full documentation, see:"
echo "  - ENV_TEMPLATE.md (all variables)"
echo "  - MULTI_LLM_SETUP_GUIDE.md (LLM provider setup)"
echo "  - VERCEL_ENV_QUICK_REFERENCE.md (Vercel deployment)"
echo ""

