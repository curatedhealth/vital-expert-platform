# Deploy Python AI Engine Today - Quick Start

**Time:** 15-30 minutes  
**Goal:** Deploy Python AI Engine to Railway so you can develop locally

---

## 🚀 Quick Deploy Steps

### 1. Install Railway CLI (2 minutes)

```bash
npm i -g @railway/cli
```

### 2. Login to Railway (1 minute)

```bash
cd services/ai-engine
railway login
```

This opens your browser to authenticate.

### 3. Initialize Project (1 minute)

```bash
railway init
```

**When asked:**
- Project name: `vital-ai-engine` (or your choice)
- Use Dockerfile? **Yes**

### 4. Set Environment Variables (5 minutes)

**Option A: Via CLI (Quick)**

```bash
# Replace with your actual values
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_ANON_KEY=your_anon_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
railway variables set OPENAI_API_KEY=sk-your-openai-key
railway variables set PINECONE_API_KEY=your-pinecone-key
railway variables set PINECONE_INDEX_NAME=vital-knowledge
```

**Option B: Via Dashboard (Easier)**

1. Go to: https://railway.app/dashboard
2. Click on your project
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add each variable:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`

### 5. Deploy (5-10 minutes)

```bash
railway up
```

This will:
1. Build your Docker image
2. Deploy to Railway
3. Give you a URL like: `https://vital-ai-engine-production.up.railway.app`

### 6. Get Your URL (1 minute)

```bash
railway domain
```

**Save this URL!** Example: `https://vital-ai-engine-production.up.railway.app`

### 7. Test Deployment (1 minute)

```bash
# Replace with your actual URL
curl https://your-project.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0"
}
```

---

## 📝 Update Local Development

### Update Frontend `.env.local`

```bash
# In apps/digital-health-startup/.env.local
AI_ENGINE_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

### Update API Gateway `.env`

```bash
# In services/api-gateway/.env
AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

---

## ✅ Verify Everything Works

### 1. Test from Terminal

```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# Metrics
curl https://your-railway-url.up.railway.app/metrics
```

### 2. Test from Local Development

```bash
# Start your local frontend
cd apps/digital-health-startup
npm run dev

# In another terminal, test API Gateway
cd services/api-gateway
npm run dev

# Test that frontend can reach AI Engine via API Gateway
curl http://localhost:3000/api/health
```

---

## 🎉 Done!

Your Python AI Engine is now deployed and accessible. You can:
- ✅ Continue developing locally
- ✅ Use the deployed AI Engine from your local frontend
- ✅ Test all your local changes against the deployed service

---

## 🆘 Troubleshooting

### Build Fails

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing environment variables → Set them in Railway dashboard
- Dockerfile error → Check `services/ai-engine/Dockerfile`
- Dependency error → Check `requirements.txt`

### Service Won't Start

**Check:**
1. All environment variables are set
2. Supabase credentials are correct
3. Port is set to 8000 (default)

**View logs:**
```bash
railway logs --tail
```

### Can't Connect from Local

**Check:**
1. `AI_ENGINE_URL` is set correctly in local `.env` files
2. CORS is configured (should work with Railway's domain)
3. No firewall blocking the connection

---

## 📚 More Help

- **Full Guide:** `services/ai-engine/DEPLOYMENT.md`
- **Railway Docs:** https://docs.railway.app
- **Quick Reference:** `services/ai-engine/QUICK_DEPLOY.md`

---

**Need help?** Check the logs with `railway logs` and see `TROUBLESHOOTING.md`

