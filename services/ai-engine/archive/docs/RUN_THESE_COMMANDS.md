# Run These Commands in Your Terminal

Since Railway CLI needs an interactive terminal, **run these commands in your own terminal** (not through Cursor):

---

## Step 1: Navigate to AI Engine Directory

```bash
cd services/ai-engine
```

---

## Step 2: Link/Create Service

```bash
railway service
```

**When prompted:**
- Select your workspace (if multiple)
- Choose: **"Create a new service"** (recommended)
- Service name: `vital-ai-engine` (or press Enter for default)

---

## Step 3: Set Environment Variables

After linking the service, run this script to set all variables:

```bash
./set-env-vars.sh
```

**Then manually set your OpenAI key:**

```bash
railway variables --set "OPENAI_API_KEY=your-actual-openai-key"
```

**Or set all variables manually:**

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

## Step 4: Deploy

```bash
railway up
```

This will:
1. Build the Docker image
2. Deploy to Railway
3. Show deployment progress

**Estimated time:** 5-10 minutes

---

## Step 5: Get Deployment URL

```bash
railway domain
```

**Save this URL!** You'll need it for local development.

Example output:
```
https://vital-ai-engine-production.up.railway.app
```

---

## Step 6: Test Deployment

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

## Step 7: Update Local Development Config

**Update `apps/digital-health-startup/.env.local`:**
```bash
AI_ENGINE_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

**Update `services/api-gateway/.env`:**
```bash
AI_ENGINE_URL=https://your-railway-url.up.railway.app
```

---

## Alternative: Use Railway Dashboard

If you prefer using the web interface:

1. Go to: https://railway.app/dashboard
2. Click on project: `vital-ai-engine-v2`
3. Click **+ New Service** → **Empty Service**
4. Service name: `vital-ai-engine`
5. Go to **Variables** tab
6. Add all environment variables (see Step 3 above)
7. Go to **Settings** tab
8. Set **Root Directory** to: `services/ai-engine`
9. Set **Build Command** to: (leave empty - uses Dockerfile)
10. Click **Deploy** or push code to trigger deployment

---

## Troubleshooting

### Service Already Exists

If a service already exists, you can link to it:

```bash
railway service existing-service-name
```

### Can't Set Variables

If `railway variables --set` doesn't work, use the dashboard:
1. Go to Railway dashboard
2. Select your service
3. Go to **Variables** tab
4. Add variables there

### Deployment Fails

Check logs:
```bash
railway logs
```

Common issues:
- Missing environment variables → Set them in dashboard
- Docker build fails → Check Dockerfile
- Service won't start → Check logs for errors

---

## Quick Reference

```bash
# Status
railway status

# Link service
railway service

# Set variable
railway variables --set "KEY=value"

# Deploy
railway up

# View logs
railway logs

# Get URL
railway domain

# Check deployment
railway status
```

---

**Run these commands in your terminal now!** 🚀

