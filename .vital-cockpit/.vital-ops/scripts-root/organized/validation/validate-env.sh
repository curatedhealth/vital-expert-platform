#!/bin/bash
# Validate environment variables for VITAL Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Validating VITAL Platform Environment Variables${NC}"
echo ""

# Load .env.local if exists
if [ -f "apps/digital-health-startup/.env.local" ]; then
    echo -e "${YELLOW}📄 Loading from apps/digital-health-startup/.env.local${NC}"
    set -a
    source apps/digital-health-startup/.env.local
    set +a
elif [ -f ".env" ]; then
    echo -e "${YELLOW}📄 Loading from .env${NC}"
    set -a
    source .env
    set +a
else
    echo -e "${RED}❌ No .env.local or .env file found${NC}"
    echo -e "${YELLOW}💡 Copy apps/digital-health-startup/.env.local.example to .env.local${NC}"
    exit 1
fi

echo ""

# Required variables
REQUIRED_VARS=(
    "OPENAI_API_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_REQUIRED=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_REQUIRED+=("$var")
    fi
done

# Optional but recommended variables
OPTIONAL_VARS=(
    "GOOGLE_API_KEY"
    "GEMINI_API_KEY"
    "ANTHROPIC_API_KEY"
    "HUGGINGFACE_API_KEY"
    "HF_TOKEN"
    "TAVILY_API_KEY"
    "PINECONE_API_KEY"
    "PINECONE_INDEX_NAME"
)

MISSING_OPTIONAL=()
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_OPTIONAL+=("$var")
    fi
done

# Report results
echo -e "${BLUE}📊 Validation Results:${NC}"
echo ""

if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All required variables are set${NC}"
else
    echo -e "${RED}❌ Missing required variables:${NC}"
    for var in "${MISSING_REQUIRED[@]}"; do
        echo -e "   ${RED}✗${NC} $var"
    done
    echo ""
    echo -e "${YELLOW}⚠️  Please set these variables in your .env.local file${NC}"
fi

echo ""

if [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
    echo -e "${YELLOW}ℹ️  Optional variables not set (these enable additional features):${NC}"
    for var in "${MISSING_OPTIONAL[@]}"; do
        echo -e "   ${YELLOW}○${NC} $var"
    done
    echo ""
    echo -e "${BLUE}💡 These are optional but recommended for full functionality${NC}"
else
    echo -e "${GREEN}✅ All optional variables are set${NC}"
fi

echo ""

# Show what's configured
echo -e "${BLUE}🔑 Configured Services:${NC}"
echo ""

[ -n "$OPENAI_API_KEY" ] && echo -e "  ${GREEN}✓${NC} OpenAI"
[ -n "$GOOGLE_API_KEY" ] || [ -n "$GEMINI_API_KEY" ] && echo -e "  ${GREEN}✓${NC} Google/Gemini"
[ -n "$ANTHROPIC_API_KEY" ] && echo -e "  ${GREEN}✓${NC} Anthropic Claude"
[ -n "$HUGGINGFACE_API_KEY" ] || [ -n "$HF_TOKEN" ] && echo -e "  ${GREEN}✓${NC} HuggingFace"
[ -n "$TAVILY_API_KEY" ] && echo -e "  ${GREEN}✓${NC} Tavily (Web Search)"
[ -n "$PINECONE_API_KEY" ] && echo -e "  ${GREEN}✓${NC} Pinecone (Vector Store)"
[ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && echo -e "  ${GREEN}✓${NC} Supabase"

echo ""

# Exit with error if required vars missing
if [ ${#MISSING_REQUIRED[@]} -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}✅ Environment validation complete${NC}"

