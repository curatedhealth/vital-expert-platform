# ============================================================================
# VITAL Platform - Frontend Environment Variables (Multi-Tenant)
# ============================================================================

# Supabase (Public - safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE

# Supabase (Server-side only - NEVER expose to browser!)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

# AI Engine URL (Server-side only)
AI_ENGINE_URL=http://localhost:8080

# OpenAI (Server-side only - for API routes)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Pinecone (Server-side only)
PINECONE_API_KEY=YOUR_PINECONE_API_KEY_HERE
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1-aws

# ============================================================================
# MULTI-TENANT CONFIGURATION
# ============================================================================

# Base domain (without subdomain)
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000

# Tenant subdomains
NEXT_PUBLIC_TENANT_VITAL_SYSTEM=vital-system.localhost:3000
NEXT_PUBLIC_TENANT_PHARMA=pharma.localhost:3000
NEXT_PUBLIC_TENANT_DIGITAL_HEALTH=digital-health.localhost:3000

# Default tenant (fallback)
NEXT_PUBLIC_DEFAULT_TENANT=vital-system

# App URLs (for each tenant)
NEXT_PUBLIC_APP_URL_VITAL_SYSTEM=http://vital-system.localhost:3000
NEXT_PUBLIC_APP_URL_PHARMA=http://pharma.localhost:3000
NEXT_PUBLIC_APP_URL_DIGITAL_HEALTH=http://digital-health.localhost:3000

# API URL (same for all tenants)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ============================================================================
# TENANT MAPPINGS (Subdomain → Tenant ID)
# ============================================================================

# These map subdomains to tenant IDs in your database
TENANT_VITAL_SYSTEM_ID=your-vital-system-tenant-uuid
TENANT_PHARMA_ID=your-pharma-tenant-uuid
TENANT_DIGITAL_HEALTH_ID=your-digital-health-tenant-uuid

# ============================================================================
# FEATURE FLAGS (Public - can be tenant-specific)
# ============================================================================

NEXT_PUBLIC_ENABLE_MODE_1=true
NEXT_PUBLIC_ENABLE_MODE_2=true
NEXT_PUBLIC_ENABLE_MODE_3=true
NEXT_PUBLIC_ENABLE_MODE_4=true

# ============================================================================
# ENVIRONMENT
# ============================================================================

NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development

# ============================================================================
# CORS & COOKIES (for multi-tenant)
# ============================================================================

# Allow all tenant subdomains
ALLOWED_ORIGINS=http://vital-system.localhost:3000,http://pharma.localhost:3000,http://digital-health.localhost:3000

# Cookie domain (for shared sessions across subdomains)
COOKIE_DOMAIN=.localhost


