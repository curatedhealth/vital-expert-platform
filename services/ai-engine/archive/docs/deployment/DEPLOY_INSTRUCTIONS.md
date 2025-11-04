# Deploy Python AI Engine - Terminal Instructions

**Run these commands in YOUR terminal** (Railway CLI needs interactive prompts):

---

## Step 1: Navigate and Create Service

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway service
```

**When prompted:**
- Select workspace: `curatedhealth's Projects` (or your workspace)
- Choose: **"Create a new service"**
- Service name: `vital-ai-engine` (or press Enter for default)

---

## Step 2: Set Environment Variables

After the service is created, run:

```bash
# Set all non-sensitive variables
./set-env-vars.sh

# Then set your OpenAI key manually:
railway variables --set "OPENAI_API_KEY=your-actual-openai-key-here"
```

**Or set all manually:**

```bash
railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"
railway variables --set "PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR"
railway variables --set "PINECONE_INDEX_NAME=vital-knowledge"
railway variables --set "OPENAI_API_KEY=your-openai-key-here"
railway variables --set "PORT=8000"
railway variables --set "LOG_LEVEL=info"
railway variables --set "EMBEDDING_PROVIDER=openai"
```

---

## Step 3: Deploy

```bash
railway up
```

This will:
- Build the Docker image
- Deploy to Railway
- Show you the deployment URL

**Time:** 5-10 minutes

---

## Step 4: Get Your Deployment URL

```bash
railway domain
```

**Save this URL!** Example: `https://vital-ai-engine-production.up.railway.app`

---

## Step 5: Test Deployment

```bash
# Replace with your actual URL
curl https://your-service.up.railway.app/health
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

## Step 6: Update Local Development

After getting your deployment URL, update:

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

## Quick Copy-Paste Commands

```bash
# 1. Navigate
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"

# 2. Create service (interactive - follow prompts)
railway service

# 3. Set variables (after service is created)
./set-env-vars.sh
railway variables --set "OPENAI_API_KEY=your-key"

# 4. Deploy
railway up

# 5. Get URL
railway domain

# 6. Test
curl https://your-url.up.railway.app/health
```

---

**Run Step 1 in your terminal now!** Then come back and tell me when the service is created. 🚀

