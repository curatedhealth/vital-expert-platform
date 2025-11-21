# Deploy Python AI Engine Now - Step by Step

**Time:** 10-15 minutes  
**Status:** Ready to deploy

---

## Current Status

✅ Railway CLI installed and logged in  
✅ Project exists: `vital-ai-engine-v2`  
⚠️ Need to create/link a service  
⚠️ Need to set environment variables  

---

## Quick Deploy Steps

### Step 1: Link to Service (2 minutes)

```bash
cd services/ai-engine
railway service
```

**When prompted:**
- Choose: "Create a new service"
- Service name: `vital-ai-engine` (or use default)

### Step 2: Set Environment Variables (3 minutes)

**Use this syntax:**
```bash
railway variables --set "SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co"
railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY"
railway variables --set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes"
railway variables --set "PINECONE_API_KEY=pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR"
railway variables --set "PINECONE_INDEX_NAME=vital-knowledge"
```

**Important:** You'll need to set `OPENAI_API_KEY` manually (it's sensitive):

```bash
railway variables --set "OPENAI_API_KEY=your-openai-key-here"
```

**Optional variables:**
```bash
railway variables --set "PORT=8000"
railway variables --set "LOG_LEVEL=info"
railway variables --set "EMBEDDING_PROVIDER=openai"
```

### Step 3: Deploy (5-10 minutes)

```bash
railway up
```

This will:
1. Build the Docker image
2. Deploy to Railway
3. Show you the deployment URL

### Step 4: Get Your URL

```bash
railway domain
```

**Or check Railway Dashboard:**
1. Go to: https://railway.app/dashboard
2. Click on your project
3. Click on the service
4. Go to **Settings** tab
5. Look for **Generate Domain** or check the domain

### Step 5: Test Deployment

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

## Alternative: Set Variables in Dashboard

If CLI doesn't work, use Railway Dashboard:

1. Go to: https://railway.app/dashboard
2. Click on project: `vital-ai-engine-v2`
3. Click on your service (or create one)
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add each variable:
   - `SUPABASE_URL` = `https://xazinxsiglqokwfmogyk.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes`
   - `OPENAI_API_KEY` = `your-openai-key` ⚠️ **Set this manually**
   - `PINECONE_API_KEY` = `pcsk_Cgs4a_8qZxwe7FZZKvKbrsBV3KTYVL1cqVBDCWuJrcxsGq9BJ4SwAkPnHQPusw4ECrKLR`
   - `PINECONE_INDEX_NAME` = `vital-knowledge`

---

## After Deployment

### 1. Update Local Development

**Update `.env.local` in frontend:**
```bash
# In apps/digital-health-startup/.env.local
AI_ENGINE_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

**Update `services/api-gateway/.env`:**
```bash
# In services/api-gateway/.env
AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

### 2. Test Local Development

```bash
# Start local frontend
cd apps/digital-health-startup
npm run dev

# In another terminal, test connection
curl http://localhost:3000/api/health
```

---

## Quick Commands Reference

```bash
# Link to service
railway service

# Set variables
railway variables --set "KEY=value"

# Deploy
railway up

# View logs
railway logs

# Get URL
railway domain

# Check status
railway status
```

---

**Ready to deploy!** Follow steps 1-5 above. 🚀

