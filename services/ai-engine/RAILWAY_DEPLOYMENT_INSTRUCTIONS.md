# 🚂 VITAL AI Engine - Railway Deployment Guide

**Status**: ✅ Ready to Deploy  
**Date**: November 3, 2025  
**Phase**: Post-MVP Launch

---

## 🎯 DEPLOYMENT OPTIONS

You have **2 ways** to deploy to Railway:

### **Option 1: Automated Script (Recommended)** ⚡

**Time**: 5 minutes  
**Difficulty**: Easy  
**Best for**: Quick deployment with your existing credentials

```bash
cd services/ai-engine
./deploy-to-railway.sh
```

This script will:
1. ✅ Check Railway CLI installation
2. ✅ Authenticate with Railway
3. ✅ Load credentials from `.env.vercel`
4. ✅ Link or create Railway project
5. ✅ Set all environment variables
6. ✅ Deploy the AI Engine
7. ✅ Verify health endpoint
8. ✅ Show logs and next steps

---

### **Option 2: Manual Deployment** 🔧

**Time**: 10 minutes  
**Difficulty**: Moderate  
**Best for**: Learning the process or custom configuration

---

## 🚀 OPTION 1: AUTOMATED DEPLOYMENT (RECOMMENDED)

### Prerequisites

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

### Deploy

```bash
cd services/ai-engine
./deploy-to-railway.sh
```

**That's it!** The script handles everything automatically.

---

## 🔧 OPTION 2: MANUAL DEPLOYMENT

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Navigate to AI Engine

```bash
cd services/ai-engine
```

### Step 4: Link or Create Project

**Option A: Link to existing project**
```bash
railway link
```

**Option B: Create new project**
```bash
railway init
```

### Step 5: Set Environment Variables

**Load your credentials**:
```bash
source ../../.env.vercel
```

**Set variables on Railway**:
```bash
# Required
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
railway variables set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
railway variables set DATABASE_URL="postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres"
railway variables set ENV="production"
railway variables set PLATFORM_TENANT_ID="550e8400-e29b-41d4-a716-446655440000"
railway variables set LOG_LEVEL="info"
railway variables set PYTHONUNBUFFERED="1"

# Optional but recommended
railway variables set CORS_ORIGINS="https://your-frontend.vercel.app"
```

### Step 6: Deploy

```bash
railway up
```

### Step 7: Verify Deployment

```bash
# Get your Railway URL
railway domain

# Test health endpoint (replace with your URL)
curl https://your-service.railway.app/health

# Watch logs
railway logs --follow
```

---

## 📋 ENVIRONMENT VARIABLES REFERENCE

### Required Variables (Already in .env.vercel)

| Variable | Value | Source |
|----------|-------|--------|
| `OPENAI_API_KEY` | `sk-proj-Ee57Y8g2NSi6...` | `.env.vercel` |
| `SUPABASE_URL` | `https://xazinxsiglqokwfmogyk.supabase.co` | `.env.vercel` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | `.env.vercel` |
| `DATABASE_URL` | `postgresql://postgres:...` | Constructed from above |
| `ENV` | `production` | Fixed |
| `PLATFORM_TENANT_ID` | `550e8400-e29b-41d4-a716-446655440000` | Fixed |
| `LOG_LEVEL` | `info` | Fixed |
| `PYTHONUNBUFFERED` | `1` | Fixed |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `*` | Comma-separated frontend URLs |
| `REDIS_URL` | None | Redis for caching (Railway add-on) |
| `PINECONE_API_KEY` | None | For vector search |
| `PINECONE_ENVIRONMENT` | None | Pinecone region |

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Get Your Railway URL

```bash
railway domain
```

**Example output**: `https://vital-ai-engine-production.up.railway.app`

### 2. Test Health Endpoint

```bash
curl https://your-service.railway.app/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "service": "vital-path-ai-services",
  "version": "2.0.0",
  "timestamp": 1699000000.0,
  "services": {
    "supabase": "healthy",
    "agent_orchestrator": "healthy",
    "rag_pipeline": "healthy",
    "unified_rag_service": "healthy"
  },
  "security": {
    "rls": {
      "enabled": "active",
      "policies_count": 41,
      "status": "healthy"
    }
  },
  "compliance": {
    "golden_rules": {
      "rule_2_multi_tenant_security": "healthy"
    }
  },
  "ready": true
}
```

### 3. Test Mode 1 Endpoint

```bash
curl -X POST https://your-service.railway.app/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "message": "What is a SaMD?",
    "agent_id": "agent-ra-001",
    "session_id": "test-session",
    "user_id": "test-user",
    "enable_rag": true,
    "model": "gpt-4"
  }'
```

**Expected**: JSON response with AI completion, reasoning, and citations.

### 4. Watch Logs

```bash
railway logs --follow
```

**Expected logs**:
```
✅ VITAL Path AI Services
✅ Tenant Isolation Middleware enabled (production mode)
✅ Rate Limiting Middleware enabled (production mode)
✅ FastAPI app ready
✅ RLS policies active: 41
```

---

## 🔒 SECURITY CHECKLIST

After deployment, verify these security features:

### ✅ Tenant Isolation

```bash
railway logs | grep "Tenant Isolation"
```

**Expected**: `✅ Tenant Isolation Middleware enabled`

### ✅ Rate Limiting

```bash
railway logs | grep "Rate Limiting"
```

**Expected**: `✅ Rate Limiting Middleware enabled`

### ✅ RLS Active

```bash
curl https://your-service.railway.app/health | jq '.security.rls'
```

**Expected**:
```json
{
  "enabled": "active",
  "policies_count": 41,
  "status": "healthy"
}
```

### ✅ HTTPS Only

```bash
curl -I https://your-service.railway.app/health
```

**Expected**: `HTTP/2 200` (Railway auto-provisions SSL)

### ✅ CORS Configured

Test that only your frontend can access the API:

```bash
curl -H "Origin: https://evil.com" https://your-service.railway.app/health
```

**Expected**: CORS error if `evil.com` not in `CORS_ORIGINS`

---

## 🔧 ADD OPTIONAL SERVICES

### Redis (Recommended for Production)

**Why**: Caching, rate limiting, session storage

**Setup**:
1. In Railway Dashboard: Click "New" → "Database" → "Redis"
2. Name it "Redis"
3. Add to AI Engine:
   ```bash
   railway variables set REDIS_URL='${{Redis.REDIS_URL}}'
   railway up  # Redeploy
   ```

**Cost**: ~$5/month

### Pinecone (For Advanced RAG)

**Why**: Vector search for knowledge base

**Setup**:
```bash
railway variables set PINECONE_API_KEY="your-key"
railway variables set PINECONE_ENVIRONMENT="us-west1-gcp"
railway up  # Redeploy
```

**Cost**: Free tier available (1GB storage)

---

## 📊 MONITORING & LOGS

### Real-time Logs

```bash
railway logs --follow
```

### Service Status

```bash
railway status
```

### Resource Usage

```bash
railway metrics
```

### Open Dashboard

```bash
railway open
```

### Health Check Endpoint

```bash
watch -n 5 'curl -s https://your-service.railway.app/health | jq'
```

---

## 💰 EXPECTED COSTS

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Railway** | Hobby | $5/month | 500 execution hours |
| **Railway** | Pro | $20/month | Unlimited hours (recommended) |
| **Compute** | ~2GB RAM | $10-20/month | Included in Railway plan |
| **Redis** | Railway Add-on | $5/month | Optional but recommended |
| **OpenAI API** | Pay-as-you-go | $0.03-0.06/request | GPT-4 usage |
| **Supabase** | Free/Pro | $0-25/month | Already using |
| **Total (MVP)** | | **$25-50/month** | Without heavy traffic |
| **Total (Production)** | | **$50-100/month** | With Redis, Pro plan |

---

## 🚨 TROUBLESHOOTING

### Build Fails

**Symptom**: Deployment fails during build

**Solution**:
```bash
# Clear cache and rebuild
railway run --clear-cache
railway up --force
```

### Can't Connect to Supabase

**Symptom**: `supabase: unavailable` in health check

**Check**:
```bash
# Verify environment variables
railway variables | grep SUPABASE

# Test DATABASE_URL
railway run python -c "import os; print(os.getenv('DATABASE_URL')[:50])"
```

**Fix**:
```bash
# Re-set DATABASE_URL
source ../../.env.vercel
railway variables set DATABASE_URL="postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres"
railway up
```

### Health Check Timeout

**Symptom**: Railway shows "Unhealthy"

**Causes**:
- `/health` endpoint takes >10s to respond
- Not enough memory (need 2GB+)
- PORT variable manually set (Railway sets it automatically)

**Fix**:
```bash
# Check memory allocation in Railway dashboard
# Upgrade to 2GB+ RAM if needed

# Verify PORT is not set
railway variables | grep PORT
# If PORT is set, unset it:
railway variables delete PORT
railway up
```

### CORS Errors

**Symptom**: Browser shows CORS errors

**Fix**:
```bash
# Add your frontend URL to CORS_ORIGINS
railway variables set CORS_ORIGINS="https://your-app.vercel.app,https://your-custom-domain.com"
railway up
```

### Logs Show Python Errors

**Symptom**: Import errors, missing modules

**Check**:
```bash
railway logs | grep "ModuleNotFoundError"
```

**Fix**:
```bash
# Verify requirements.txt is up to date
cat requirements.txt

# Rebuild
railway up --force
```

---

## 📝 UPDATE DEPLOYMENT

### After Code Changes

```bash
# Commit changes
git add .
git commit -m "Update AI Engine"
git push

# Railway auto-deploys on push to main branch
# Or manually deploy:
railway up
```

### After Environment Variable Changes

```bash
railway variables set NEW_VAR="value"
railway up  # Restart with new variables
```

### Rollback to Previous Version

```bash
# In Railway Dashboard:
# Deployments → Click on previous successful deployment → "Redeploy"
```

---

## 🎯 MULTI-ENVIRONMENT SETUP (OPTIONAL)

### Create Dev, Preview, Production Environments

**Railway supports multiple environments**:

```bash
# Create dev environment
railway environment create dev
railway environment switch dev
railway variables set ENV="development"
railway up

# Create preview environment
railway environment create preview
railway environment switch preview
railway variables set ENV="preview"
railway up

# Switch back to production
railway environment switch production
```

**Cost**: Each environment counts toward your usage hours.

---

## 📚 RELATED DOCUMENTATION

- ✅ `RAILWAY_QUICK_DEPLOY.md` - Quick reference (this file)
- ✅ `RAILWAY_DEPLOYMENT_AUDIT.md` - Complete deployment audit
- ✅ `RAILWAY_MULTI_ENV_GUIDE.md` - Multi-environment setup
- ✅ `railway.env.template` - All environment variables
- ✅ `Dockerfile` - Build configuration
- ✅ `start.py` - Entry point
- ✅ `RLS_PRODUCTION_DEPLOYMENT_COMPLETE.md` - RLS deployment status

---

## 🎯 QUICK REFERENCE COMMANDS

```bash
# Deploy
cd services/ai-engine
./deploy-to-railway.sh

# Get URL
railway domain

# View logs
railway logs --follow

# Check status
railway status

# Open dashboard
railway open

# Update variables
railway variables set VAR="value"

# Redeploy
railway up

# Switch environment
railway environment switch production
```

---

## 🎊 NEXT STEPS AFTER DEPLOYMENT

1. ✅ **Update Frontend** - Point your Next.js app to Railway URL
2. ✅ **Test E2E** - Run all 4 modes with production API
3. ✅ **Monitor** - Watch logs for first 24 hours
4. ✅ **Set up Alerts** - Railway dashboard → Notifications
5. ✅ **Scale** - Add Redis, increase memory if needed

---

## 🆘 SUPPORT

**Railway**:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**VITAL Platform**:
- Documentation: `docs/README.md`
- Architecture: `docs/architecture/`
- Deployment Guides: `docs/guides/deployment/`

---

**READY TO DEPLOY?** 🚀

```bash
cd services/ai-engine
./deploy-to-railway.sh
```

---

*Generated: November 3, 2025*  
*Status: Production Ready ✅*

