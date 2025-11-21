# Environment Variables Setup Guide

This guide explains how to configure environment variables for both the Python backend and Next.js frontend using `.env.local` files.

---

## 🐍 Python Backend (AI Engine)

**File**: `services/ai-engine/.env.local`

```bash
# ============================================================================
# SUPABASE
# ============================================================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================================================
# OPENAI
# ============================================================================
OPENAI_API_KEY=sk-your-openai-api-key-here

# ============================================================================
# SERVER CONFIGURATION
# ============================================================================
PORT=8080
HOST=0.0.0.0
ENVIRONMENT=development

# ============================================================================
# REDIS (Optional - for caching)
# ============================================================================
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# ============================================================================
# PINECONE (for RAG)
# ============================================================================
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=vital-knowledge

# ============================================================================
# COHERE (Optional - for reranking)
# ============================================================================
COHERE_API_KEY=your-cohere-api-key-here

# ============================================================================
# LANGGRAPH CONFIGURATION
# ============================================================================
LANGGRAPH_CHECKPOINT_DB=sqlite:///data/checkpoints.db
LANGGRAPH_ENABLE_CHECKPOINTS=true

# ============================================================================
# MONITORING (Optional)
# ============================================================================
LOG_LEVEL=INFO
```

### Loading Environment Variables (Python)

The Python backend will automatically load `.env.local` if you use `python-dotenv`:

```python
# In your main.py or startup script
from dotenv import load_dotenv
import os

# Load .env.local
load_dotenv('.env.local')

# Access variables
supabase_url = os.getenv('SUPABASE_URL')
port = int(os.getenv('PORT', 8080))
```

---

## ⚛️ Next.js Frontend

**File**: `apps/digital-health-startup/.env.local`

```bash
# ============================================================================
# SUPABASE (Public)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================================================
# SUPABASE (Server-side only - keep private!)
# ============================================================================
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================================================
# AI ENGINE URL
# ============================================================================
# Local development
AI_ENGINE_URL=http://localhost:8080

# Production (uncomment when deploying)
# AI_ENGINE_URL=https://your-ai-engine.railway.app

# ============================================================================
# OPENAI (if used directly in frontend)
# ============================================================================
OPENAI_API_KEY=sk-your-openai-api-key-here

# ============================================================================
# PINECONE (if used directly in frontend)
# ============================================================================
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=vital-knowledge

# ============================================================================
# APP CONFIGURATION
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ============================================================================
# FEATURE FLAGS
# ============================================================================
NEXT_PUBLIC_ENABLE_MODE_1=true
NEXT_PUBLIC_ENABLE_MODE_2=true
NEXT_PUBLIC_ENABLE_MODE_3=true
NEXT_PUBLIC_ENABLE_MODE_4=true

# ============================================================================
# ANALYTICS (Optional)
# ============================================================================
NEXT_PUBLIC_ANALYTICS_ENABLED=false

# ============================================================================
# ENVIRONMENT
# ============================================================================
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
```

### Important Notes for Next.js:

1. **Public vs Private Variables**:
   - `NEXT_PUBLIC_*` variables are exposed to the browser
   - Variables without `NEXT_PUBLIC_` are server-side only
   - **Never** put secret keys in `NEXT_PUBLIC_*` variables!

2. **Auto-loading**:
   - Next.js automatically loads `.env.local`
   - No additional configuration needed

3. **Accessing Variables**:
   ```typescript
   // Client-side (browser)
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   
   // Server-side only (API routes, server components)
   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
   const aiEngineUrl = process.env.AI_ENGINE_URL;
   ```

---

## 📝 Setup Instructions

### 1. Python Backend

```bash
cd services/ai-engine

# If .env.local doesn't exist, create it
touch .env.local

# Edit the file and add your variables
nano .env.local
# Or use your preferred editor

# Install python-dotenv if needed
pip install python-dotenv

# Start the server (will auto-load .env.local)
uvicorn src.api.main:app --reload --port 8080
```

### 2. Next.js Frontend

```bash
cd apps/digital-health-startup

# If .env.local doesn't exist, create it
touch .env.local

# Edit the file and add your variables
nano .env.local
# Or use your preferred editor

# Start the dev server (will auto-load .env.local)
npm run dev
```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` files**:
   - Already in `.gitignore`
   - Contains sensitive secrets

2. **Use different values per environment**:
   - Development: `.env.local`
   - Staging: Set in hosting platform
   - Production: Set in hosting platform

3. **Rotate keys regularly**:
   - API keys should be rotated every 90 days
   - Service role keys monthly

4. **Principle of least privilege**:
   - Frontend: Only public/anon keys
   - Backend: Service role keys
   - Never expose service role keys to browser

---

## 🚀 Deployment

### Railway (Python Backend)

Set environment variables in Railway dashboard:
```bash
railway variables set SUPABASE_URL=https://...
railway variables set SUPABASE_SERVICE_ROLE_KEY=...
railway variables set OPENAI_API_KEY=...
railway variables set PORT=8080
```

### Vercel (Next.js Frontend)

Set environment variables in Vercel dashboard:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add AI_ENGINE_URL
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
```

---

## ✅ Verification

### Python Backend

```bash
# Check if variables are loaded
cd services/ai-engine
python -c "
from dotenv import load_dotenv
import os
load_dotenv('.env.local')
print('SUPABASE_URL:', os.getenv('SUPABASE_URL'))
print('PORT:', os.getenv('PORT'))
print('AI_ENGINE_URL:', os.getenv('AI_ENGINE_URL'))
"
```

### Next.js Frontend

```bash
# Check if variables are loaded
cd apps/digital-health-startup
node -e "
require('dotenv').config({ path: '.env.local' });
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('AI_ENGINE_URL:', process.env.AI_ENGINE_URL);
"
```

---

## 📖 Variable Reference

### Required Variables

| Variable | Backend | Frontend | Description |
|----------|---------|----------|-------------|
| `SUPABASE_URL` | ✅ | ✅ (PUBLIC) | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ (Private) | Service role key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | ✅ | Public anon key |
| `OPENAI_API_KEY` | ✅ | ⚠️ (Optional) | OpenAI API key |
| `AI_ENGINE_URL` | ❌ | ✅ (Private) | Backend URL |
| `PORT` | ✅ | ❌ | Server port (8080) |

### Optional Variables

| Variable | Backend | Frontend | Description |
|----------|---------|----------|-------------|
| `REDIS_URL` | ✅ | ❌ | Redis for caching |
| `PINECONE_API_KEY` | ✅ | ⚠️ | Pinecone vector DB |
| `COHERE_API_KEY` | ✅ | ❌ | Cohere reranking |
| `LOG_LEVEL` | ✅ | ❌ | Logging level |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | ❌ | ✅ | Analytics toggle |

---

## 🐛 Troubleshooting

### Python: Variables not loading

```bash
# Check if .env.local exists
ls -la services/ai-engine/.env.local

# Check file permissions
chmod 600 services/ai-engine/.env.local

# Ensure python-dotenv is installed
pip list | grep python-dotenv

# Load explicitly in code
from dotenv import load_dotenv
load_dotenv('.env.local')
```

### Next.js: Variables not loading

```bash
# Check if .env.local exists
ls -la apps/digital-health-startup/.env.local

# Restart dev server (Next.js reads .env on startup)
npm run dev

# Check for syntax errors in .env.local
# - No spaces around =
# - No quotes needed for values
# - One variable per line
```

### Common Issues

1. **Port already in use**: Change `PORT=8080` to another port
2. **Invalid Supabase URL**: Must start with `https://`
3. **API key format**: OpenAI keys start with `sk-`
4. **Missing NEXT_PUBLIC_**: Public vars need this prefix

---

**Summary**: 
- Python backend: `services/ai-engine/.env.local` (port 8080)
- Next.js frontend: `apps/digital-health-startup/.env.local`
- Both files auto-load on startup
- Never commit these files to git


