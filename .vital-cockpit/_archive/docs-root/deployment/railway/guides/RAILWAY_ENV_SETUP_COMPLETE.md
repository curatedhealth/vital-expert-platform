# ✅ Railway Environment Variables - Setup Complete

**Status**: 🟢 Ready for Manual Population  
**Date**: November 4, 2025

---

## 📦 FILES CREATED

1. ✅ **`railway-environment-variables.json`** 
   - Contains ALL actual API keys from `.env.vercel`
   - **⚠️ DO NOT COMMIT THIS FILE**
   - Use it to manually populate Railway
   - Delete after you're done

2. ✅ **`RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md`**
   - Human-readable guide (safe to commit)
   - Sanitized (no actual keys)
   - Deployment instructions

3. ✅ **`setup-railway-env.sh`**
   - Helper script with instructions
   - Run it for step-by-step guide

---

## 🚀 QUICK START

### Step 1: Open Railway Dashboard
Go to: https://railway.app/project/YOUR_PROJECT_ID/service/ai-engine

Click on **"Variables"** tab

### Step 2: Add Critical Variables (Required)
Open `railway-environment-variables.json` and copy these **5 variables**:

```bash
PORT=8080
OPENAI_API_KEY=<from line 21 in JSON>
SUPABASE_URL=<from line 28 in JSON>
SUPABASE_SERVICE_ROLE_KEY=<from line 35 in JSON>
SUPABASE_ANON_KEY=<from line 42 in JSON>
```

**How to add in Railway:**
- Click "New Variable"
- Paste key name (e.g., `PORT`)
- Paste value (e.g., `8080`)
- Click "Add"
- Repeat for each variable

### Step 3: Add High Priority Variables (Recommended)
Search in the JSON file for these keys and add them:

```bash
TAVILY_API_KEY
LANGCHAIN_API_KEY
LANGCHAIN_PROJECT=vital-advisory-board
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
HUGGINGFACE_API_KEY
GOOGLE_API_KEY
LOG_LEVEL=info
PYTHONUNBUFFERED=1
ENV=production
```

### Step 4: Watch Deployment
- Railway auto-redeploys when you save variables
- Check logs for: `🚀 Starting VITAL AI Engine on port 8080`
- Wait for: `✅ Application startup complete`

### Step 5: Verify Deployment
```bash
curl https://vital-expert-platform-production.up.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "services": {
    "supabase": "healthy",    ← Should be "healthy"
    "agent_orchestrator": "healthy"
  },
  "ready": true
}
```

### Step 6: Clean Up (IMPORTANT!)
```bash
# Delete the JSON file with secrets
rm railway-environment-variables.json

# Add to gitignore
echo 'railway-environment-variables.json' >> .gitignore

# Commit the safe guide
git add RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md setup-railway-env.sh
git commit -m "docs: add Railway environment variables guide"
git push origin main
```

---

## 📊 WHAT EACH PRIORITY LEVEL GIVES YOU

### 🔴 CRITICAL (5 vars) - Minimum to Start
- ✅ App starts and listens on port 8080
- ✅ Basic AI chat works (GPT-4)
- ✅ Database connection works
- ❌ No web search
- ❌ No monitoring/tracing

### 🟡 HIGH PRIORITY (+7 vars = 12 total) - Production Ready
- ✅ Everything from Critical
- ✅ Real-time web search (Tavily)
- ✅ LLM tracing and monitoring (LangSmith)
- ✅ Alternative models (HuggingFace, Gemini)
- ✅ Production mode (tenant isolation enabled)

### 🟢 OPTIONAL (+30 vars = 40+ total) - Maximum Features
- ✅ Everything from High Priority
- ✅ Vector database (Pinecone)
- ✅ Redis caching
- ✅ Self-hosted LangFuse observability
- ✅ Specialized medical models
- ✅ Fine-tuned confidence scoring
- ✅ Anthropic Claude
- ✅ Full monitoring suite

---

## 🎯 RECOMMENDED APPROACH

**For Production Launch:**
1. Start with **CRITICAL** variables (5 vars)
2. Test that app starts and responds
3. Add **HIGH PRIORITY** variables (7 more vars)
4. Test full functionality
5. Add **OPTIONAL** variables incrementally as needed

**Total time:** ~10 minutes for Critical + High Priority

---

## 🔍 TROUBLESHOOTING

### Service Shows "unavailable" in Health Check
- **supabase unavailable**: Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- **agent_orchestrator unavailable**: Check OPENAI_API_KEY
- **All unavailable**: Missing critical variables

### App Won't Start (502 errors)
- Missing one of the 5 CRITICAL variables
- Check Railway logs for specific error

### App Starts But Features Don't Work
- **No web search**: Add TAVILY_API_KEY
- **No tracing**: Add LANGCHAIN_API_KEY and related vars
- **No monitoring**: Check LOG_LEVEL and ENABLE_MONITORING

---

## 📝 CHECKLIST

- [ ] Open Railway dashboard → Variables tab
- [ ] Add 5 CRITICAL variables
- [ ] Wait for redeploy (~2 min)
- [ ] Verify health endpoint returns 200
- [ ] Add 7 HIGH PRIORITY variables
- [ ] Wait for redeploy (~2 min)
- [ ] Verify services show "healthy"
- [ ] Delete `railway-environment-variables.json`
- [ ] Add to `.gitignore`
- [ ] Commit safe guide files
- [ ] Test AI Engine endpoints

---

## ✅ SUCCESS CRITERIA

Your deployment is successful when:

1. ✅ Health endpoint returns `"status": "healthy"`
2. ✅ Services show `"healthy"` (not "unavailable")
3. ✅ Railway logs show port 8080
4. ✅ No 502 errors when accessing public URL
5. ✅ AI chat responds correctly
6. ✅ Web search works (if Tavily key added)

---

## 🎉 YOU'RE DONE!

Once you see all ✅ above, your AI Engine is fully deployed and ready for production!

**Next steps:**
- Test AI Modes 1-4 from your frontend
- Monitor LangSmith dashboard for LLM traces
- Check health endpoint regularly
- Scale up if needed in Railway settings

---

**Need help?** Check `RAILWAY_ENVIRONMENT_VARIABLES_GUIDE.md` for detailed explanations of each variable.

