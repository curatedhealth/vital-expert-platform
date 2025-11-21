# 🚀 Railway Deployment Steps

## Quick Start Commands

**Run these in order in your terminal:**

### Step 1: Link/Create Service

```bash
cd services/ai-engine
railway service
```

**Follow the prompts:**
- Select your workspace
- Choose "Create a new service" or select existing
- Service name: `vital-ai-engine`

---

### Step 2: Set Environment Variables

```bash
# Run the script (sets most variables)
./set-env-vars.sh

# Set OpenAI key (required)
railway variables --set "OPENAI_API_KEY=your-actual-openai-key"
```

---

### Step 3: Deploy

```bash
railway up
```

**This builds and deploys using:**
- ✅ Dockerfile (Python 3.11)
- ✅ Fixed dependencies (pydantic-settings)
- ✅ All environment variables

---

### Step 4: Get URL

```bash
railway domain
```

**Save this URL!**

---

## Alternative: Use Railway Dashboard

1. **Go to:** https://railway.app/dashboard
2. **Select/Create Project:** `vital-ai-engine-v2`
3. **Create/Select Service:** `vital-ai-engine`
4. **Settings → Source:**
   - Root Directory: `services/ai-engine`
   - Build Command: (auto-detected from Dockerfile)
5. **Settings → Deploy:**
   - Builder: DOCKERFILE
   - Dockerfile Path: `Dockerfile`
6. **Variables Tab:**
   - Add all environment variables (see RAILWAY_DEPLOY_NOW.md)
7. **Deploy Button:** Click to deploy

---

## What's Ready

✅ **Dockerfile**: Python 3.11, pydantic-settings, all fixes  
✅ **railway.toml**: Configured for DOCKERFILE builder  
✅ **Requirements**: All dependencies fixed  
✅ **Code**: Committed to GitHub  

---

**Start with: `railway service` to link/create the service!**

