# Complete Environment Variables Reference

This document lists all environment variables used across the VITAL platform.

## Location

**Frontend (Next.js):** `apps/digital-health-startup/.env.local`  
**Python AI Engine:** `services/ai-engine/.env` (for Docker/local)  
**Docker Compose:** Project root `.env` file (shared)

## Required Variables

### Core Services (Required)
```bash
# OpenAI - Required for LLM operations
OPENAI_API_KEY=sk-...

# Supabase - Required for database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## Optional Variables

### LLM Providers

#### Google Gemini
```bash
GOOGLE_API_KEY=AIzaSy...
GEMINI_API_KEY=AIzaSy...
```

#### Anthropic Claude
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

#### HuggingFace
```bash
HUGGINGFACE_API_KEY=hf_...
HF_TOKEN=hf_...  # Alternative token name
```

### Vector Stores & Search

#### Pinecone
```bash
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1
```

#### Tavily (Web Search)
```bash
TAVILY_API_KEY=tvly-...
```

### Configuration

#### Embedding Provider
```bash
EMBEDDING_PROVIDER=openai  # or 'huggingface'
HUGGINGFACE_EMBEDDING_MODEL=bge-base-en-v1.5
USE_HUGGINGFACE_API=false
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
OPENAI_MODEL=gpt-4-turbo-preview
```

#### Vector Configuration
```bash
VECTOR_DIMENSION=1536
SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=10
```

#### Server Configuration
```bash
PORT=8000  # Python AI Engine
NODE_ENV=development
LOG_LEVEL=info
PYTHONUNBUFFERED=1
```

#### API Gateway
```bash
API_GATEWAY_URL=http://localhost:3001
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001
```

#### Database & Caching
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/vital_path
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

#### Observability
```bash
LANGFUSE_PUBLIC_KEY=...
LANGFUSE_HOST=https://cloud.langfuse.com
SENTRY_DSN=...
```

#### Security
```bash
JWT_SECRET=...  # Min 32 characters
ENCRYPTION_KEY=...  # Min 32 characters
CSRF_SECRET=...  # Min 32 characters
```

## How to Get API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Sign in and create a new API key
3. Copy the key (starts with `sk-`)

### Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy `Project URL` and keys

### Google/Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Copy the key (starts with `AIzaSy`)

### Anthropic (Claude)
1. Go to https://console.anthropic.com/
2. Sign up/Login
3. API Keys section
4. Create new key (starts with `sk-ant-`)

### HuggingFace
1. Go to https://huggingface.co/settings/tokens
2. Create new token
3. Copy the token (starts with `hf_`)

### Pinecone
1. Go to https://app.pinecone.io/
2. Sign up/Login
3. API Keys section
4. Create API key (starts with `pcsk_`)

### Tavily
1. Go to https://tavily.com
2. Sign up for free account
3. Dashboard → API Keys
4. Copy the key (starts with `tvly-`)

## Quick Setup Script

Run this to create your `.env.local` file:

```bash
cd apps/digital-health-startup
cp .env.local.example .env.local
# Then edit .env.local with your actual keys
```

## Verification

After setting up your environment variables:

1. **Frontend:**
   ```bash
   cd apps/digital-health-startup
   npm run dev
   # Should start without errors
   ```

2. **Python AI Engine:**
   ```bash
   cd services/ai-engine
   python start.py
   # Should start on port 8000
   ```

3. **Docker:**
   ```bash
   docker-compose -f docker-compose.python-only.yml up -d
   # Check logs for connection errors
   ```

## Security Notes

- ⚠️ **Never commit `.env.local` or `.env` files to Git**
- ✅ All `.env*` files are already in `.gitignore`
- ✅ Use `.env.example` files as templates
- ✅ Rotate API keys regularly
- ✅ Use different keys for development and production
- ✅ Store production keys in secure secret management systems

## Troubleshooting

**Missing API Key Error:**
- Check the variable name matches exactly (case-sensitive)
- Verify the key is in the correct `.env` file
- Restart the service after adding new variables

**Connection Errors:**
- Verify API keys are valid and not expired
- Check network connectivity
- Review service logs for detailed error messages

