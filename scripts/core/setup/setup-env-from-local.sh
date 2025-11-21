#!/bin/bash
# Copy environment variables from .env.local to Docker .env file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}📋 Setting up environment variables for Docker${NC}"
echo ""

ENV_LOCAL="$PROJECT_ROOT/apps/digital-health-startup/.env.local"
ENV_FILE="$PROJECT_ROOT/.env"

if [ ! -f "$ENV_LOCAL" ]; then
    echo -e "${RED}❌ .env.local not found at: $ENV_LOCAL${NC}"
    echo -e "${YELLOW}💡 Please create .env.local first${NC}"
    exit 1
fi

echo -e "${YELLOW}📄 Reading from: $ENV_LOCAL${NC}"

# Extract relevant variables from .env.local
echo "" > "$ENV_FILE"
echo "# VITAL Platform Environment Variables" >> "$ENV_FILE"
echo "# Auto-generated from apps/digital-health-startup/.env.local" >> "$ENV_FILE"
echo "# Generated: $(date)" >> "$ENV_FILE"
echo "" >> "$ENV_FILE"

# Required variables
REQUIRED_VARS=(
    "OPENAI_API_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

# Optional variables
OPTIONAL_VARS=(
    "GOOGLE_API_KEY"
    "GEMINI_API_KEY"
    "ANTHROPIC_API_KEY"
    "HUGGINGFACE_API_KEY"
    "HF_TOKEN"
    "TAVILY_API_KEY"
    "PINECONE_API_KEY"
    "PINECONE_INDEX_NAME"
    "PINECONE_ENVIRONMENT"
    "DATABASE_URL"
    "REDIS_URL"
    "EMBEDDING_PROVIDER"
    "HUGGINGFACE_EMBEDDING_MODEL"
    "USE_HUGGINGFACE_API"
    "OPENAI_EMBEDDING_MODEL"
    "OPENAI_MODEL"
    "VECTOR_DIMENSION"
    "SIMILARITY_THRESHOLD"
    "MAX_SEARCH_RESULTS"
)

# Map NEXT_PUBLIC_SUPABASE_URL to SUPABASE_URL for Python
echo "# ============================================================================" >> "$ENV_FILE"
echo "# Required Variables" >> "$ENV_FILE"
echo "# ============================================================================" >> "$ENV_FILE"

for var in "${REQUIRED_VARS[@]}"; do
    # Map NEXT_PUBLIC_SUPABASE_URL to SUPABASE_URL
    if [ "$var" = "NEXT_PUBLIC_SUPABASE_URL" ]; then
        value=$(grep "^${var}=" "$ENV_LOCAL" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
        if [ -n "$value" ]; then
            echo "SUPABASE_URL=$value" >> "$ENV_FILE"
            echo -e "  ${GREEN}✓${NC} SUPABASE_URL (from NEXT_PUBLIC_SUPABASE_URL)"
        fi
        
        # Also include SUPABASE_ANON_KEY
        anon_key=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$ENV_LOCAL" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
        if [ -n "$anon_key" ]; then
            echo "SUPABASE_ANON_KEY=$anon_key" >> "$ENV_FILE"
            echo -e "  ${GREEN}✓${NC} SUPABASE_ANON_KEY (from NEXT_PUBLIC_SUPABASE_ANON_KEY)"
        fi
    elif [ "$var" = "NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        # Skip - already handled above
        continue
    else
        value=$(grep "^${var}=" "$ENV_LOCAL" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
        if [ -n "$value" ]; then
            echo "${var}=$value" >> "$ENV_FILE"
            echo -e "  ${GREEN}✓${NC} $var"
        else
            echo -e "  ${YELLOW}○${NC} $var (not found)"
        fi
    fi
done

echo "" >> "$ENV_FILE"
echo "# ============================================================================" >> "$ENV_FILE"
echo "# Optional Variables" >> "$ENV_FILE"
echo "# ============================================================================" >> "$ENV_FILE"

for var in "${OPTIONAL_VARS[@]}"; do
    value=$(grep "^${var}=" "$ENV_LOCAL" 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
    if [ -n "$value" ]; then
        echo "${var}=$value" >> "$ENV_FILE"
        echo -e "  ${GREEN}✓${NC} $var"
    fi
done

echo ""
echo -e "${GREEN}✅ Environment file created at: $ENV_FILE${NC}"
echo ""
echo -e "${BLUE}💡 This .env file will be used by Docker Compose${NC}"
echo -e "${BLUE}💡 You can edit it manually if needed${NC}"

