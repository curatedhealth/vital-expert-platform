# ============================================================================
# VITAL EXPERT PLATFORM - ENVIRONMENT VARIABLES
# ============================================================================
# Copy this file to apps/digital-health-startup/.env.local and fill in your actual values
# ============================================================================

# ============================================================================
# NEXT.JS & APPLICATION
# ============================================================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# ============================================================================
# DATABASE (PostgreSQL via Supabase)
# ============================================================================
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Optional database pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# ============================================================================
# SUPABASE
# ============================================================================
# Get these from: https://supabase.com/dashboard/project/[project-id]/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters

# ============================================================================
# REDIS & CACHING
# ============================================================================
# Option 1: Standard Redis
REDIS_URL=redis://localhost:6379

# Option 2: Upstash Redis (serverless)
# Get these from: https://console.upstash.com/
# UPSTASH_REDIS_REST_URL=https://[name].upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token

# Cache configuration
REDIS_KEY_PREFIX=vital:
CACHE_TTL=3600

# ============================================================================
# LLM PROVIDERS
# ============================================================================

# OpenAI (REQUIRED for Ask Panel embeddings)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...
OPENAI_ORG_ID=org-...
# NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-... # Only if needed client-side (not recommended)

# Anthropic Claude (Optional)
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-...

# Google AI / Gemini (Optional)
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=AIzaSy...
GOOGLE_GEMINI_MODEL=gemini-1.5-pro

# Groq (Optional - Fast inference)
# Get from: https://console.groq.com/keys
GROQ_API_KEY=gsk_...

# Together AI (Optional - Open source models)
# Get from: https://api.together.xyz/settings/api-keys
TOGETHER_API_KEY=...

# Replicate (Optional - Open source models)
# Get from: https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=r8_...

# HuggingFace (Optional - For medical/clinical models)
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MEDICAL_MODEL=epfl-llm/meditron-70b
HUGGINGFACE_CLINICAL_MODEL=microsoft/BioGPT-Large
HUGGINGFACE_RESEARCH_MODEL=meta-llama/Llama-2-70b-chat-hf

# Cohere (Optional)
# Get from: https://dashboard.cohere.com/api-keys
COHERE_API_KEY=...

# Mistral AI (Optional)
# Get from: https://console.mistral.ai/
MISTRAL_API_KEY=...

# ============================================================================
# VECTOR STORES
# ============================================================================

# Pinecone (Optional - for advanced RAG)
# Get from: https://app.pinecone.io/
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=vital-expert

# ============================================================================
# OBSERVABILITY & MONITORING
# ============================================================================

# Sentry (Error Tracking & Performance)
# Get from: https://sentry.io/settings/[org]/projects/[project]/keys/
NEXT_PUBLIC_SENTRY_DSN=https://...@o...ingest.sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=vital-frontend

# OpenTelemetry (Optional)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=vital-expert-platform

# Prometheus (Optional)
PROMETHEUS_PORT=9090

# ============================================================================
# SECURITY & AUTHENTICATION
# ============================================================================

# Generate secure random strings for these:
# Use: openssl rand -base64 32

JWT_SECRET=your-super-secret-jwt-key-min-32-characters
ENCRYPTION_KEY=your-super-secret-encryption-key-32-chars
CSRF_SECRET=your-csrf-secret-min-32-characters
SESSION_SECRET=your-session-secret-min-32-characters

# CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# ============================================================================
# FEATURE FLAGS
# ============================================================================

ENABLE_RATE_LIMITING=true
ENABLE_CIRCUIT_BREAKERS=true
ENABLE_AUDIT_LOGGING=true
ENABLE_EXPERIMENTAL=false
DEBUG=false

# ============================================================================
# COMPLIANCE & REGULATION
# ============================================================================

HIPAA_ENABLED=true
GDPR_ENABLED=true
DATA_RETENTION_DAYS=730
AUDIT_RETENTION_DAYS=2555

# ============================================================================
# AGENT CONFIGURATION
# ============================================================================

# Agent selection weights (total should = 1.0)
AGENT_WEIGHT_SEMANTIC=0.4
AGENT_WEIGHT_DOMAIN=0.3
AGENT_WEIGHT_TIER=0.15
AGENT_WEIGHT_POPULARITY=0.10
AGENT_WEIGHT_AVAILABILITY=0.05

# ============================================================================
# RATE LIMITING
# ============================================================================

RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
RATE_LIMIT_PER_DAY_IP=10000

# ============================================================================
# TIMEOUTS (in milliseconds)
# ============================================================================

ORCHESTRATION_TIMEOUT=300000
LLM_TIMEOUT=120000
DB_QUERY_TIMEOUT=30000
VECTOR_SEARCH_TIMEOUT=10000

# ============================================================================
# AWS (Optional - for S3 file storage)
# ============================================================================

# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=AKIA...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_BUCKET=vital-expert-files

# ============================================================================
# PYTHON AI ENGINE (for Railway deployment)
# ============================================================================

# Railway will inject these automatically:
# RAILWAY_ENVIRONMENT=production
# RAILWAY_PROJECT_ID=...
# RAILWAY_SERVICE_ID=...

# Python AI Engine URL
NEXT_PUBLIC_API_URL=https://vital-ai-engine.railway.app
PYTHON_AI_ENGINE_URL=https://vital-ai-engine.railway.app

# ============================================================================
# VERCEL (Deployment)
# ============================================================================

# Vercel will inject these automatically:
# VERCEL=1
# VERCEL_ENV=production
# VERCEL_URL=...
# VERCEL_GIT_COMMIT_SHA=...
# NEXT_PUBLIC_VERCEL_ENV=production

# ============================================================================
# QUICK START - MINIMUM REQUIRED VARIABLES
# ============================================================================
# Copy these to .env.local to get started:
#
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key  
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# OPENAI_API_KEY=sk-your-openai-key
# DATABASE_URL=your-database-url
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=generate-with-openssl-rand-base64-32
# ENCRYPTION_KEY=generate-with-openssl-rand-base64-32
# CSRF_SECRET=generate-with-openssl-rand-base64-32

