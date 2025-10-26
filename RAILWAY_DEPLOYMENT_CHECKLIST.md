# Railway Deployment Checklist - VITAL Platform

**Quick Start Guide for Manual Deployment**

---

## Prerequisites ✅

- [x] Railway CLI installed (v4.10.0)
- [x] Dockerfiles created (ai-engine, api-gateway)
- [x] Source code ready in `services/` directory
- [ ] Railway account logged in
- [ ] Environment variables prepared

---

## Part 1: Deploy AI Engine (Python FastAPI)

### Step 1: Login to Railway

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
railway login
```

This will open your browser. Click "Authorize" to log in.

---

### Step 2: Initialize New Project

```bash
railway init
```

**When prompted:**
- Project name: `vital-ai-engine`
- Select: "Create new project"

---

### Step 3: Deploy to Railway

```bash
railway up
```

This will:
1. Build the Docker image (using Dockerfile)
2. Push to Railway
3. Deploy to production

**Expected output:**
```
✓ Building...
✓ Pushing...
✓ Deploying...
✓ Deployment successful
```

---

### Step 4: Set Environment Variables

**Option A: Via Dashboard (Recommended)**

1. Go to https://railway.app/dashboard
2. Select `vital-ai-engine` project
3. Click on the service
4. Go to "Variables" tab
5. Add the following variables:

```env
# OpenAI
OPENAI_API_KEY=<your-openai-key>

# Supabase
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# App Config
ENVIRONMENT=production
LOG_LEVEL=info
MAX_TOKENS=4096
TEMPERATURE=0.7
```

**Option B: Via CLI**

```bash
railway variables set OPENAI_API_KEY=<your-key>
railway variables set SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your-key>
railway variables set ENVIRONMENT=production
railway variables set LOG_LEVEL=info
railway variables set MAX_TOKENS=4096
railway variables set TEMPERATURE=0.7
```

---

### Step 5: Generate Public Domain

```bash
railway domain
```

**Expected output:**
```
https://ai-engine-production-xxxxx.up.railway.app
```

**Save this URL - you'll need it for api-gateway!**

---

### Step 6: Test AI Engine

```bash
# Test health endpoint
curl https://your-ai-engine-url.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "ai-engine",
  "version": "1.0.0"
}
```

---

## Part 2: Deploy API Gateway (Node.js)

### Step 1: Navigate to API Gateway

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/api-gateway"
```

---

### Step 2: Initialize New Project

```bash
railway init
```

**When prompted:**
- Project name: `vital-api-gateway`
- Select: "Create new project"

---

### Step 3: Deploy

```bash
railway up
```

---

### Step 4: Set Environment Variables

**Using Railway Dashboard:**

1. Go to https://railway.app/dashboard
2. Select `vital-api-gateway` project
3. Go to "Variables" tab
4. Add:

```env
# AI Engine URL (from Part 1, Step 5)
AI_ENGINE_URL=https://your-ai-engine-url.up.railway.app

# Supabase
SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Node Config
NODE_ENV=production
PORT=3001
```

---

### Step 5: Generate Public Domain

```bash
railway domain
```

**Save this URL - you'll need it for frontend!**

Example: `https://api-gateway-production-xxxxx.up.railway.app`

---

### Step 6: Test API Gateway

```bash
# Test health endpoint
curl https://your-api-gateway-url.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "api-gateway",
  "connections": {
    "aiEngine": "connected",
    "redis": "not-configured"
  }
}
```

---

## Part 3: Add Redis Cache (Optional but Recommended)

### Step 1: Add Redis via Dashboard

1. Go to Railway Dashboard
2. Click "New Service"
3. Select "Database"
4. Choose "Redis"
5. Name: `vital-redis`

---

### Step 2: Get Redis URL

1. Click on the Redis service
2. Go to "Variables" tab
3. Copy `REDIS_URL` value

Example: `redis://default:password@redis.railway.internal:6379`

---

### Step 3: Add Redis URL to Services

**For AI Engine:**
```bash
cd services/ai-engine
railway variables set REDIS_URL="<redis-url-from-step-2>"
```

**For API Gateway:**
```bash
cd services/api-gateway
railway variables set REDIS_URL="<redis-url-from-step-2>"
```

---

## Part 4: Verification

### Test Complete Flow

```bash
# 1. Test AI Engine directly
curl https://your-ai-engine-url.up.railway.app/health

# 2. Test API Gateway health
curl https://your-api-gateway-url.up.railway.app/health

# 3. Test chat completion through gateway
curl -X POST https://your-api-gateway-url.up.railway.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, this is a test message"}
    ],
    "model": "gpt-4-turbo-preview"
  }'
```

**Expected:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! ..."
    }
  }]
}
```

---

## Part 5: Monitor Logs

### View Logs

```bash
# AI Engine logs
cd services/ai-engine
railway logs

# API Gateway logs
cd services/api-gateway
railway logs
```

### Check Metrics

Go to Railway Dashboard:
- CPU usage
- Memory usage
- Network I/O
- Request count

---

## Troubleshooting

### Issue: Deployment Failed

**Check logs:**
```bash
railway logs
```

**Common fixes:**
- Missing environment variables
- Docker build error (check Dockerfile syntax)
- Port already in use (ensure using PORT from env)

---

### Issue: Service Not Responding

**Check health endpoint:**
```bash
curl https://your-service-url/health
```

**If 503 error:**
- Service might be starting (wait 1-2 minutes)
- Check Railway dashboard for deployment status
- View logs for errors

---

### Issue: Can't Connect to AI Engine

**Check API Gateway logs:**
```bash
cd services/api-gateway
railway logs
```

**Look for:**
- ECONNREFUSED errors
- Wrong AI_ENGINE_URL variable
- Network timeout

**Fix:**
```bash
# Update AI_ENGINE_URL
railway variables set AI_ENGINE_URL=<correct-url>
```

---

## Quick Commands Reference

```bash
# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# View logs
railway logs

# Set variable
railway variables set KEY=value

# List variables
railway variables

# Get service URL
railway domain

# Rollback
railway rollback
```

---

## URLs to Save

After deployment, save these URLs:

```
AI Engine: https://______________________.up.railway.app
API Gateway: https://______________________.up.railway.app
Redis: redis://______________________
```

**Next Step:** Use API Gateway URL in Vercel frontend deployment

---

## Estimated Time

- AI Engine deployment: 10-15 minutes
- API Gateway deployment: 10-15 minutes
- Redis setup: 5 minutes
- Testing: 10 minutes
- **Total: 35-45 minutes**

---

## Cost Breakdown

| Service | Plan | Cost/Month |
|---------|------|------------|
| AI Engine | 8GB RAM | $20 |
| API Gateway | 2GB RAM | $5 |
| Redis | 256MB | $5 |
| **Total** | | **$30** |

---

## Support

If you encounter issues:
1. Check Railway docs: https://docs.railway.app
2. View [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions
3. Check Railway Discord community

---

**Created:** October 26, 2025
**Status:** Ready to Execute
**Next:** Follow steps above, then deploy frontend to Vercel
