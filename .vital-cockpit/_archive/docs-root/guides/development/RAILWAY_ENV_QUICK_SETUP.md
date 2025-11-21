# Railway Environment Variables - Quick Setup

## 📋 Copy-Paste Ready for Railway Dashboard

Go to your Railway project → **Variables** tab → Add these:

---

## ✅ REQUIRED VARIABLES (You MUST set these)

```bash
# 1. Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# 2. OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

**Replace:**
- `your-project` with your actual Supabase project ID
- `your-supabase-service-role-key` with your key from Supabase Settings → API
- `sk-your-openai-api-key` with your OpenAI API key

---

## ⚙️ RECOMMENDED VARIABLES (Copy as-is)

```bash
LOG_LEVEL=info
WORKERS=0
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
EMBEDDING_MODEL=all-mpnet-base-v2
MEMORY_CACHE_TTL=86400
AUTONOMOUS_COST_LIMIT=10.0
AUTONOMOUS_RUNTIME_LIMIT=30
MAX_TOOL_CHAIN_LENGTH=5
TOOL_CHAIN_PLANNING_MODEL=gpt-4-turbo-preview
TOOL_CHAIN_SYNTHESIS_MODEL=gpt-4-turbo-preview
```

**Note:** Copy these exactly as shown (no modifications needed)

---

## 🔴 DO NOT SET THESE

```bash
# Railway provides PORT automatically - DO NOT SET IT
# PORT=8000  ← Don't add this!
```

---

## 🎯 STEP-BY-STEP IN RAILWAY

### Step 1: Open Variables Tab
1. Go to your Railway project
2. Click on your service
3. Click **"Variables"** tab

### Step 2: Add Required Variables
Click **"New Variable"** and add one at a time:

**Variable 1:**
- Name: `SUPABASE_URL`
- Value: `https://your-project.supabase.co` (your actual URL)

**Variable 2:**
- Name: `SUPABASE_KEY`
- Value: `eyJ...` (your actual service role key)

**Variable 3:**
- Name: `OPENAI_API_KEY`
- Value: `sk-...` (your actual API key)

### Step 3: Add All Recommended Variables
Click **"Raw Editor"** (faster way):

```
LOG_LEVEL=info
WORKERS=0
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
EMBEDDING_MODEL=all-mpnet-base-v2
MEMORY_CACHE_TTL=86400
AUTONOMOUS_COST_LIMIT=10.0
AUTONOMOUS_RUNTIME_LIMIT=30
MAX_TOOL_CHAIN_LENGTH=5
TOOL_CHAIN_PLANNING_MODEL=gpt-4-turbo-preview
TOOL_CHAIN_SYNTHESIS_MODEL=gpt-4-turbo-preview
```

Paste this entire block, then click **"Update Variables"**

---

## 🔍 WHERE TO FIND YOUR VALUES

### Supabase URL & Key
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **URL** → Use as `SUPABASE_URL`
   - **service_role (secret)** → Use as `SUPABASE_KEY`

### OpenAI API Key
1. Go to https://platform.openai.com
2. Click **API Keys** (left sidebar)
3. Create new key or copy existing
4. Use as `OPENAI_API_KEY`

---

## ✅ VERIFICATION CHECKLIST

After adding variables, verify:
- [ ] 3 required variables added
- [ ] 11 recommended variables added
- [ ] Total: 14 variables
- [ ] NO `PORT` variable set
- [ ] Click "Deploy" to restart with new variables

---

## 📊 COMPLETE VARIABLE LIST

Here's what you should have (14 total):

1. ✅ SUPABASE_URL
2. ✅ SUPABASE_KEY
3. ✅ OPENAI_API_KEY
4. ✅ LOG_LEVEL
5. ✅ WORKERS
6. ✅ PYTHONUNBUFFERED
7. ✅ PYTHONDONTWRITEBYTECODE
8. ✅ EMBEDDING_MODEL
9. ✅ MEMORY_CACHE_TTL
10. ✅ AUTONOMOUS_COST_LIMIT
11. ✅ AUTONOMOUS_RUNTIME_LIMIT
12. ✅ MAX_TOOL_CHAIN_LENGTH
13. ✅ TOOL_CHAIN_PLANNING_MODEL
14. ✅ TOOL_CHAIN_SYNTHESIS_MODEL

---

## 🚀 AFTER ADDING VARIABLES

Railway will automatically:
1. Detect variable changes
2. Trigger a new deployment
3. Restart your service with new config

Watch the logs for:
```
✅ EmbeddingService initialized
✅ SessionMemoryService initialized  
✅ AutonomousController ready
```

---

## 🎉 YOU'RE READY!

Once all variables are set, your deployment will have:
- ✅ Database connection
- ✅ OpenAI integration
- ✅ Phase 2 Memory system
- ✅ Phase 3 Autonomous execution

**That's it! The service will start automatically.** 🚀

