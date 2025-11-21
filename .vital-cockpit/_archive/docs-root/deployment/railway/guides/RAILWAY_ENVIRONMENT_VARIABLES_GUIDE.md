# 🔑 Railway Environment Variables - Complete Guide

**Project**: VITAL Path AI Engine  
**Last Updated**: November 4, 2025  
**Railway Service**: `ai-engine` (Production)

---

## 📋 QUICK SUMMARY

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 **CRITICAL** | 5 | Required for startup |
| 🟡 **HIGH** | 7 | Recommended for production |
| 🟢 **OPTIONAL** | 30+ | Feature-specific |

---

## 🔴 CRITICAL (Required - App Won't Start Without These)

### Core API Keys
```bash
PORT=8080
OPENAI_API_KEY=your-openai-key-from-.env.vercel
SUPABASE_URL=your-supabase-url-from-.env.vercel
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-from-.env.vercel
SUPABASE_ANON_KEY=your-supabase-anon-key-from-.env.vercel
```

**📝 Get your actual values from:** `.env.vercel` or `railway-environment-variables.json`

**What These Do:**
- `PORT`: Railway expects app on this port (must be 8080)
- `OPENAI_API_KEY`: Powers GPT-4 and text embeddings
- `SUPABASE_URL`: Your database connection
- `SUPABASE_SERVICE_ROLE_KEY`: Backend database access (bypasses RLS)
- `SUPABASE_ANON_KEY`: Client-side database access (enforces RLS)

---

## 🟡 HIGH PRIORITY (Strongly Recommended)

### Web Search & Tools
```bash
TAVILY_API_KEY=your-tavily-key-from-.env.vercel
```
**Enables**: Real-time web search, current information lookup

### Observability & Monitoring
```bash
LANGCHAIN_API_KEY=your-langchain-key-from-.env.vercel
LANGCHAIN_PROJECT=vital-advisory-board
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```
**Enables**: LLM tracing, performance monitoring, debug insights

### Alternative LLM Providers
```bash
HUGGINGFACE_API_KEY=your-huggingface-key-from-.env.vercel
GOOGLE_API_KEY=your-google-key-from-.env.vercel
```
**Enables**: Specialized medical models, Gemini models

### Configuration
```bash
LOG_LEVEL=info
PYTHONUNBUFFERED=1
ENV=production
```
**Enables**: Proper logging, production mode (activates tenant isolation)

---

## 🟢 OPTIONAL (Add As Needed)

### Redis Caching
```bash
REDIS_URL=redis://your-redis-url
ENABLE_REDIS_CACHE=true
```
**Note**: App gracefully falls back to memory cache if not provided

### LangFuse (Self-Hosted Observability)
```bash
LANGFUSE_PUBLIC_KEY=your-public-key
LANGFUSE_SECRET_KEY=your-secret-key
LANGFUSE_HOST=https://your-langfuse-instance.com
```

### Pinecone Vector Database
```bash
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1
```
**Note**: Falls back to Supabase pgvector if not provided

### Additional LLM Providers
```bash
ANTHROPIC_API_KEY=your-anthropic-key
GEMINI_API_KEY=AIzaSyDeOjggoNgBU0Z6mlpUiiZKsFM43vHjFX0
```

### HuggingFace Specialized Models
```bash
HUGGINGFACE_MEDICAL_MODEL=CuratedHealth/meditron70b-qlora-1gpu
HUGGINGFACE_CLINICAL_MODEL=CuratedHealth/meditron7b-lora-chat
HUGGINGFACE_RESEARCH_MODEL=CuratedHealth/Qwen3-8B-SFT-20250917123923
HF_TOKEN=your-huggingface-token-from-.env.vercel
```

### Security (Production)
```bash
JWT_SECRET=your-strong-secret-here
JWT_ALGORITHM=HS256
ADMIN_API_KEY=your-admin-key
BYPASS_ADMIN_AUTH=false
```

### Embedding Configuration
```bash
EMBEDDING_PROVIDER=openai
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
OPENAI_MODEL=gpt-4-turbo-preview
VECTOR_DIMENSION=1536
SIMILARITY_THRESHOLD=0.7
MAX_SEARCH_RESULTS=10
```

### Monitoring
```bash
ENABLE_MONITORING=true
ENABLE_TRACING=false
PROMETHEUS_PORT=9090
```

### Confidence Score Tuning
```bash
CONFIDENCE_RAG_WEIGHT=0.40
CONFIDENCE_ALIGNMENT_WEIGHT=0.40
CONFIDENCE_COMPLETENESS_WEIGHT=0.20
CONFIDENCE_BOOST_REGULATORY=0.05
CONFIDENCE_BOOST_CLINICAL=0.03
CONFIDENCE_BOOST_PHARMA=0.04
CONFIDENCE_BOOST_MEDICAL=0.03
```

---

## 🚀 DEPLOYMENT STEPS

### Option 1: Railway Dashboard (Recommended)
1. Go to Railway dashboard
2. Click on `ai-engine` service
3. Go to **"Variables"** tab
4. Click **"New Variable"** for each variable
5. Copy-paste from the lists above
6. Railway auto-redeploys when you save

### Option 2: Railway CLI
```bash
# Set variables using Railway CLI
railway variables set PORT=8080
railway variables set OPENAI_API_KEY="your-key-here"
# ... repeat for all variables
```

---

## 📊 RECOMMENDED CONFIGURATIONS

### Minimal (Critical Only)
**5 variables** - Basic functionality
- ✅ App starts and responds
- ✅ Basic AI chat works
- ❌ No web search
- ❌ No monitoring

### Standard (Critical + High Priority)
**12 variables** - Production-ready
- ✅ Full AI capabilities
- ✅ Web search enabled
- ✅ LLM tracing/monitoring
- ✅ Alternative models

### Complete (All Variables)
**40+ variables** - Maximum features
- ✅ All features enabled
- ✅ Full observability
- ✅ Vector database
- ✅ Fine-tuned confidence scoring

---

## ✅ VERIFICATION

After setting variables, verify deployment:

### 1. Check Deployment Logs
Look for:
```
🚀 Starting VITAL AI Engine on port 8080
✅ Main module imported successfully
INFO: Uvicorn running on http://0.0.0.0:8080
```

### 2. Test Health Endpoint
```bash
curl https://vital-expert-platform-production.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "services": {
    "supabase": "healthy",
    "agent_orchestrator": "healthy",
    "rag_pipeline": "healthy"
  },
  "ready": true
}
```

### 3. Check Service Status
In the health response:
- ✅ `"supabase": "healthy"` → Supabase keys working
- ✅ `"agent_orchestrator": "healthy"` → OpenAI key working
- ⚠️ `"unavailable"` → Missing that service's API key

---

## 🔍 TROUBLESHOOTING

### Service Shows "unavailable"
- **supabase**: Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **agent_orchestrator**: Check `OPENAI_API_KEY`
- **rag_pipeline**: Check `OPENAI_API_KEY` and embedding config

### App Doesn't Start
- Verify all **CRITICAL** variables are set
- Check `PORT=8080` matches Railway networking
- Check Railway logs for specific error messages

### 502 Bad Gateway
- Port mismatch: Verify `PORT=8080`
- App crashed: Check Railway logs for Python errors
- Health check failing: App might still be starting (wait 30s)

---

## 📝 NOTES

1. **All keys are from your existing `.env.vercel` file** - these are your production values
2. **Railway auto-redeploys** when you change variables (~2-3 minutes)
3. **Start with CRITICAL variables**, then add others incrementally
4. **Keys are already included** in the JSON file (`railway-environment-variables.json`)
5. **Port must be 8080** to match your Railway networking configuration

---

## 📄 FILES CREATED

1. **`railway-environment-variables.json`** - Complete structured JSON with all variables
2. **This file** - Human-readable deployment guide

Use whichever format is easier for you! 🚀

