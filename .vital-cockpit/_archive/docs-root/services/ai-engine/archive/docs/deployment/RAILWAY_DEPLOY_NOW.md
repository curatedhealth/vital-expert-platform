# 🚀 Railway Deployment - Quick Start

## Current Status

✅ **Railway CLI**: Installed  
✅ **Dockerfile**: Python 3.11 with pydantic-settings  
✅ **railway.toml**: Updated to use DOCKERFILE builder  
⚠️ **Service**: Needs to be linked  

---

## Step 1: Link/Create Service (Interactive - You Must Run This)

**Open your terminal and run:**

```bash
cd services/ai-engine
railway service
```

**When prompted:**
1. Select workspace: `curatedhealth's Projects` (or your workspace)
2. Choose: **"Create a new service"** or select existing
3. Service name: `vital-ai-engine` (or press Enter for default)

---

## Step 2: Set Environment Variables

After linking the service, run:

```bash
# Set all non-sensitive variables
./set-env-vars.sh

# Then set your OpenAI key:
railway variables --set "OPENAI_API_KEY=your-actual-openai-key-here"
```

**OR set all manually:**

```bash
railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"
railway variables --set "PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR"
railway variables --set "PINECONE_INDEX_NAME=vital-knowledge"
railway variables --set "OPENAI_API_KEY=your-openai-key-here"
railway variables --set "PORT=8000"
railway variables --set "LOG_LEVEL=info"
```

---

## Step 3: Deploy

```bash
railway up
```

**This will:**
- Build Docker image from Dockerfile (Python 3.11)
- Install all dependencies (including pydantic-settings)
- Deploy to Railway
- Show deployment URL

**Estimated time:** 5-10 minutes

---

## Step 4: Get Your URL

```bash
railway domain
```

**Save this URL!** Example: `https://vital-ai-engine-production.up.railway.app`

---

## Step 5: Test Deployment

```bash
# Replace with your actual URL
curl https://your-url.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0"
}
```

---

## What's Fixed

✅ **Python 3.11** - Fixes langsmith compatibility  
✅ **pydantic-settings** - Fixes BaseSettings import  
✅ **Dockerfile** - Multi-stage build optimized  
✅ **railway.toml** - Uses DOCKERFILE builder  

---

## Troubleshooting

### Issue: "Service not linked"

**Fix:**
```bash
railway service
# Follow prompts to create or link service
```

### Issue: "Build fails"

**Fix:**
1. Check Railway logs: `railway logs`
2. Verify Dockerfile exists: `ls -la Dockerfile`
3. Check requirements.txt is valid

### Issue: "Health check fails"

**Fix:**
1. Check logs: `railway logs`
2. Verify environment variables are set: `railway variables`
3. Check if OPENAI_API_KEY is set

---

## Quick Command Reference

```bash
# Link service (interactive)
railway service

# Set variables
./set-env-vars.sh
railway variables --set "OPENAI_API_KEY=your-key"

# Deploy
railway up

# Get URL
railway domain

# View logs
railway logs

# Check status
railway status
```

---

**Ready? Run `railway service` first to link/create the service!**

