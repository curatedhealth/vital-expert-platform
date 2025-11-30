# 🔐 VITAL Path - Environment Variables Setup Guide

## 📋 Quick Setup Instructions

### 1. **Copy Template**
```bash
cp ENV_VARIABLES_TEMPLATE.md .env
```

### 2. **Edit `.env` file with your actual values**

---

## ⚡ Minimum Required Variables (For Testing)

Copy these into your `.env` file at the root of the project:

```bash
# ============================================
# 📊 SUPABASE (Database & Auth) - REQUIRED
# ============================================
SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Public-facing (for browser)
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Alias variables for compatibility
NEW_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEW_SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# ============================================
# 🤖 OPENAI (LLM & Embeddings) - REQUIRED
# ============================================
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# ============================================
# 🚀 AI ENGINE & API GATEWAY
# ============================================
PYTHON_AI_ENGINE_URL=http://localhost:8000
API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
```

---

## 🎯 Complete Environment Variables Template

```bash
# ============================================
# 🔐 VITAL Path - Environment Variables
# ============================================
# Copy this to .env and fill in your values
# IMPORTANT: Never commit .env to version control!

# ============================================
# 📊 SUPABASE (Database & Auth) - REQUIRED
# ============================================
SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Public-facing (for browser)
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alias variables for compatibility
NEW_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEW_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct Postgres connection (optional)
DATABASE_URL=postgresql://postgres:[password]@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres

# ============================================
# 🤖 OPENAI (LLM & Embeddings) - REQUIRED
# ============================================
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
OPENAI_ORG_ID=org-your-org-id-here

# ============================================
# 🎯 PINECONE (Vector Database) - RECOMMENDED
# ============================================
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1-aws

# ============================================
# 🌐 ALTERNATIVE LLM PROVIDERS (Optional)
# ============================================

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google Gemini
GOOGLE_API_KEY=your-google-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# HuggingFace (for embeddings)
HUGGINGFACE_API_KEY=hf_your-huggingface-key-here
HF_TOKEN=hf_your-huggingface-token-here
HUGGINGFACE_EMBEDDING_MODEL=mixedbread-ai/mxbai-embed-large-v1
USE_HUGGINGFACE_API=false
EMBEDDING_PROVIDER=openai

# Local Ollama (for local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b

# ============================================
# 🔍 WEB SEARCH & TOOLS (Optional)
# ============================================
TAVILY_API_KEY=tvly-your-tavily-key-here

# ============================================
# 🧠 GRAPH DATABASE (Optional - Advanced)
# ============================================
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password
NEO4J_DATABASE=neo4j

# ============================================
# 💾 REDIS (Caching - Optional)
# ============================================
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# ============================================
# 🚀 AI ENGINE & API GATEWAY
# ============================================
PYTHON_AI_ENGINE_URL=http://localhost:8000
API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# ============================================
# 📊 MONITORING & OBSERVABILITY (Optional)
# ============================================

# Langfuse (LLM Observability)
LANGFUSE_SECRET_KEY=sk-lf-your-langfuse-secret
LANGFUSE_PUBLIC_KEY=pk-lf-your-langfuse-public
LANGFUSE_HOST=https://cloud.langfuse.com

# LangSmith (LangChain Tracing)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=ls__your-langsmith-key
LANGCHAIN_PROJECT=vital-path

# Helicone (LLM Proxy & Analytics)
HELICONE_API_KEY=sk-helicone-your-key

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Prometheus (Metrics)
PROMETHEUS_PORT=9090

# ============================================
# 🔒 SECURITY & AUTHENTICATION
# ============================================
NEXTAUTH_SECRET=your-nextauth-secret-generate-with-openssl
NEXTAUTH_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRY=7d

# API Key Header
API_KEY_HEADER=X-API-Key

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# ============================================
# 🏥 HEALTHCARE COMPLIANCE (Default: Enabled)
# ============================================
HIPAA_COMPLIANCE_ENABLED=true
FDA_21CFR11_ENABLED=true
AUDIT_TRAIL_ENABLED=true
MEDICAL_ACCURACY_THRESHOLD=0.95
PHARMA_PROTOCOL_ENABLED=true
VERIFY_PROTOCOL_ENABLED=true

# ============================================
# ⚙️ APPLICATION CONFIGURATION
# ============================================

# Environment
NODE_ENV=development
DEBUG=false
LOG_LEVEL=INFO

# Vector Database
VECTOR_DIMENSION=1536
SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=10

# Agent Configuration
MAX_CONCURRENT_AGENTS=10
AGENT_TIMEOUT_SECONDS=300
MAX_CONTEXT_LENGTH=16000

# Rate Limiting
RATE_LIMIT_RPM=100
RATE_LIMIT_TPM=100000

# WebSocket Configuration
WEBSOCKET_HEARTBEAT_INTERVAL=30
MAX_WEBSOCKET_CONNECTIONS=100

# ============================================
# 🎨 FRONTEND CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_NAME=VITAL Path
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_WORKFLOW_DESIGNER=true

# ============================================
# 📧 EMAIL (Optional - for notifications)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@vitalpath.ai

# ============================================
# 🗄️ BACKUP & STORAGE (Optional)
# ============================================

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=vital-path-storage

# Cloudflare R2 (alternative to S3)
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=vital-path

# ============================================
# 🧪 TESTING & DEVELOPMENT
# ============================================
SKIP_AUTH_IN_DEV=false
MOCK_AI_RESPONSES=false
ENABLE_DEBUG_LOGGING=false

# ============================================
# 📱 MOBILE & PWA (Optional)
# ============================================
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false

# ============================================
# 💳 BILLING & PAYMENTS (Optional)
# ============================================
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ============================================
# 📊 ANALYTICS (Optional)
# ============================================
GOOGLE_ANALYTICS_ID=G-YOUR-GA-ID
MIXPANEL_TOKEN=your-mixpanel-token
POSTHOG_KEY=phc_your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# ============================================
# 🎯 TENANT CONFIGURATION (Multi-tenant)
# ============================================
DEFAULT_TENANT_SLUG=vital-system
ENABLE_MULTI_TENANCY=false

# ============================================
# 🚀 DEPLOYMENT (Production)
# ============================================
# Vercel
VERCEL_URL=your-app.vercel.app
VERCEL_ENV=production

# Railway
RAILWAY_STATIC_URL=your-app.railway.app
RAILWAY_ENVIRONMENT=production
```

---

## 📝 How to Get API Keys

### 1. **Supabase**
1. Go to https://supabase.com/dashboard
2. Select your project: `bomltkhixeatxuoxmolq`
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. **OpenAI**
1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Copy the key → `OPENAI_API_KEY`

### 3. **Pinecone** (Optional but Recommended for RAG)
1. Go to https://www.pinecone.io/
2. Sign up for free account
3. Create an index named `vital-knowledge`
4. Go to **API Keys**
5. Copy API key → `PINECONE_API_KEY`

### 4. **Anthropic Claude** (Optional)
1. Go to https://console.anthropic.com/
2. Create API key
3. Copy → `ANTHROPIC_API_KEY`

### 5. **HuggingFace** (Optional - for free embeddings)
1. Go to https://huggingface.co/settings/tokens
2. Create token
3. Copy → `HUGGINGFACE_API_KEY`

### 6. **Tavily** (Optional - for web search)
1. Go to https://app.tavily.com/
2. Sign up
3. Copy API key → `TAVILY_API_KEY`

---

## 🚀 Testing Your Setup

After adding environment variables, restart your services:

```bash
# Kill existing servers
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Start frontend
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
pnpm --filter @vital/vital-system dev

# Start AI Engine (in new terminal)
cd services/ai-engine
python3 -m uvicorn src.main:app --reload --port 8000
```

### Test Workflow with AI:

1. Open http://localhost:3000/designer
2. Click **Templates** → Select any template
3. Click **Test Workflow** button
4. Enter a test query
5. Verify AI response appears!

---

## ⚠️ Important Notes

### Required for Basic Functionality:
- ✅ `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `OPENAI_API_KEY`

### Recommended for Full Features:
- 🎯 `PINECONE_API_KEY` (for RAG/knowledge base)
- 🚀 `PYTHON_AI_ENGINE_URL` (for LangGraph workflows)

### Optional Enhancements:
- 📊 Monitoring tools (Langfuse, LangSmith, Sentry)
- 🔍 Web search (Tavily)
- 🧠 Graph database (Neo4j)
- 💾 Caching (Redis)

---

## 🔐 Security Best Practices

1. **Never commit `.env` to git**
   - It's already in `.gitignore`
   
2. **Use different keys for dev/prod**
   - Keep production keys separate
   
3. **Rotate keys regularly**
   - Especially if they're exposed

4. **Use environment-specific files**
   - `.env.local` for local development
   - `.env.production` for production
   
5. **Store secrets securely in production**
   - Use Vercel/Railway secret management
   - Use AWS Secrets Manager
   - Use HashiCorp Vault

---

## 🎯 Quick Start Checklist

- [ ] Copy this template to `.env`
- [ ] Get Supabase keys from dashboard
- [ ] Get OpenAI API key
- [ ] (Optional) Get Pinecone API key
- [ ] Restart frontend server
- [ ] Test workflow designer
- [ ] Verify AI responses work

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Need Help?** Check the existing `.env` file at the root of the project for current values.






