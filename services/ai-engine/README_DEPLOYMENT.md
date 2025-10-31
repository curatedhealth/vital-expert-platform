# 🚀 Python AI Engine - Deployment Status

**Service:** `vital-ai-engine` ✅ Created  
**Project:** `vital-ai-engine-v2`  
**Status:** Ready to deploy (need OPENAI_API_KEY)

---

## ✅ What's Done

1. ✅ Railway service created
2. ✅ Service linked: `vital-ai-engine`
3. ✅ Environment variables configured:
   - ✅ SUPABASE_URL
   - ✅ SUPABASE_ANON_KEY
   - ✅ SUPABASE_SERVICE_ROLE_KEY
   - ✅ PINECONE_API_KEY
   - ✅ PINECONE_INDEX_NAME
   - ✅ PORT=8000
   - ✅ LOG_LEVEL=info
   - ✅ EMBEDDING_PROVIDER=openai

---

## ⚠️ Action Required

### Set OpenAI API Key

```bash
cd services/ai-engine
railway variables --set "OPENAI_API_KEY=your-actual-openai-key"
```

**Important:** Replace `your-actual-openai-key` with your actual OpenAI API key (starts with `sk-`)

---

## 🚀 Deploy Now

After setting OPENAI_API_KEY, run:

```bash
cd services/ai-engine
railway up
```

**Estimated time:** 5-10 minutes for first deployment

---

## 📋 After Deployment

### 1. Get Your URL

```bash
railway domain
```

**Save this URL!** Example: `https://vital-ai-engine-production.up.railway.app`

### 2. Test Deployment

```bash
curl https://your-url.up.railway.app/health
```

### 3. Update Local Development

**`apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

**`services/api-gateway/.env`:**
```bash
AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

---

## 🔍 Quick Commands

```bash
# Set OpenAI key (DO THIS FIRST)
railway variables --set "OPENAI_API_KEY=your-key"

# Deploy
railway up

# View logs
railway logs

# Get URL
railway domain

# Check status
railway status

# View all variables
railway variables
```

---

**Next Step:** Set `OPENAI_API_KEY` then run `railway up` 🚀

