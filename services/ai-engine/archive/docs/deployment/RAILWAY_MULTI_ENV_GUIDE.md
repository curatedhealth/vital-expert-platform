# 🚂 Railway Multi-Environment Deployment Guide

## Strategy: 3-Tier Deployment

```
Local Dev (Minimal Engine) → Dev (Railway) → Preview (Railway) → Production (Railway)
    ↓                            ↓                ↓                    ↓
Port 8000                   Full Engine      Full Engine         Full Engine  
Minimal deps                Testing          Staging             Production
Zero setup                  Debug ON         Debug OFF           Debug OFF
```

---

## 🏗️ Environment Setup

### Environment 1: **dev** (Pre-Production)
**Purpose**: Development testing with full logging
**URL**: `https://ai-engine-dev.up.railway.app`

### Environment 2: **preview** (Staging)
**Purpose**: Final testing before production
**URL**: `https://ai-engine-preview.up.railway.app`

### Environment 3: **production**
**Purpose**: Live production service
**URL**: `https://ai-engine.up.railway.app`

---

## 📋 Setup Instructions

### Step 1: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init
# Name: "vital-ai-engine"
# Select: "Empty Project"
```

### Step 2: Create 3 Environments

**In Railway Dashboard**:
1. Go to project settings
2. Click "Environments" tab
3. Create environments:
   - `dev` (default)
   - `preview`
   - `production`

### Step 3: Create Service for Each Environment

For each environment, create a service:

```bash
# Link to dev environment
railway environment dev
railway service create ai-engine-dev

# Link to preview environment
railway environment preview
railway service create ai-engine-preview

# Link to production environment  
railway environment production
railway service create ai-engine-prod
```

---

## 🔐 Environment Variables

### Common Variables (All Environments)

```bash
# Core
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
LOG_LEVEL=info

# Tenant
PLATFORM_TENANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### Dev Environment Variables

```bash
railway environment dev

# Environment
ENV=development
DEBUG=true

# OpenAI (use dev key with lower limits)
OPENAI_API_KEY=sk-dev-your-key

# Supabase (dev project)
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-dev-key
DATABASE_URL=postgresql://postgres:[PWD]@db.your-dev-project.supabase.co:5432/postgres

# CORS (allow localhost)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-dev-frontend.vercel.app

# Redis (optional)
REDIS_URL=${{Redis.REDIS_URL}}

# Rate Limiting (lenient for testing)
RATE_LIMIT_RPM=1000
RATE_LIMIT_TPM=500000
```

### Preview Environment Variables

```bash
railway environment preview

# Environment
ENV=preview  
DEBUG=false

# OpenAI (use production key)
OPENAI_API_KEY=sk-your-prod-key

# Supabase (staging project or production with staging data)
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-staging-key
DATABASE_URL=postgresql://postgres:[PWD]@db.your-staging-project.supabase.co:5432/postgres

# CORS (staging frontend)
CORS_ORIGINS=https://your-preview-frontend.vercel.app,https://staging.your-app.com

# Redis
REDIS_URL=${{Redis.REDIS_URL}}

# Rate Limiting (production-like)
RATE_LIMIT_RPM=100
RATE_LIMIT_TPM=100000
```

### Production Environment Variables

```bash
railway environment production

# Environment
ENV=production
RAILWAY_ENVIRONMENT=production  # Triggers production middleware
DEBUG=false

# OpenAI (production key with monitoring)
OPENAI_API_KEY=sk-your-prod-key

# Supabase (production)
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-prod-key
DATABASE_URL=postgresql://postgres:[PWD]@db.your-prod-project.supabase.co:5432/postgres

# CORS (production domains only)
CORS_ORIGINS=https://your-app.com,https://www.your-app.com,https://app.your-app.com

# Redis (production instance)
REDIS_URL=${{Redis.REDIS_URL}}

# Rate Limiting (strict)
RATE_LIMIT_RPM=60
RATE_LIMIT_TPM=50000

# Optional: Pinecone for production
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=vital-production
PINECONE_ENVIRONMENT=your-env
```

---

## 🚀 Deployment Commands

### Deploy to Dev

```bash
# Switch to dev environment
railway environment dev

# Deploy
railway up

# Watch logs
railway logs --follow

# Get URL
railway domain
```

### Deploy to Preview

```bash
# Switch to preview environment
railway environment preview

# Deploy
railway up

# Test
curl https://ai-engine-preview.up.railway.app/health
```

### Deploy to Production

```bash
# Switch to production environment
railway environment production

# Deploy (with confirmation)
railway up

# Monitor
railway logs --follow --tail 100

# Verify
curl https://ai-engine.up.railway.app/health
```

---

## 🔄 Deployment Workflow

### Recommended Flow

```
1. Code Changes
   ↓
2. Test Locally (Minimal Engine on port 8000)
   ↓
3. Commit to Git
   ↓
4. Deploy to DEV
   railway environment dev
   railway up
   ↓
5. Test in DEV
   - Check logs
   - Test all 4 modes
   - Verify LangGraph workflows
   ↓
6. Deploy to PREVIEW
   railway environment preview
   railway up
   ↓
7. Final Testing in PREVIEW
   - Full integration tests
   - Load testing
   - Security testing
   ↓
8. Deploy to PRODUCTION
   railway environment production
   railway up
   ↓
9. Monitor Production
   - Watch logs for errors
   - Check metrics
   - Verify health endpoints
```

---

## 📊 Environment Comparison

| Feature | Local (Minimal) | Dev | Preview | Production |
|---------|----------------|-----|---------|------------|
| **Engine** | Minimal | Full | Full | Full |
| **Port** | 8000 | Railway auto | Railway auto | Railway auto |
| **Middleware** | Disabled | Disabled | Enabled | Enabled |
| **Logging** | Simple | JSON | JSON | JSON |
| **Rate Limiting** | Off | Lenient | Strict | Strict |
| **Debug** | On | On | Off | Off |
| **Monitoring** | None | Basic | Full | Full + Alerts |
| **OpenAI Key** | Personal | Dev | Prod | Prod |
| **Supabase** | Mock/None | Dev | Staging | Production |
| **Redis** | Optional | Optional | Yes | Yes |
| **CORS** | Wide open | Localhost + dev | Staging domains | Prod domains only |

---

## ✅ Verification Checklist

### After Deploying to Each Environment

```bash
# 1. Check health endpoint
curl https://your-service.railway.app/health

# Expected: {"status": "healthy", "ready": true, ...}

# 2. Check metrics
curl https://your-service.railway.app/metrics

# 3. Test Mode 1
curl -X POST https://your-service.railway.app/api/mode1/manual \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "message": "Test query",
    "agent_id": "test_agent",
    "session_id": "test",
    "user_id": "test",
    "enable_rag": true,
    "model": "gpt-4"
  }'

# 4. Check logs for middleware
railway logs | grep "Middleware enabled"
# Should see:
# - "✅ Tenant Isolation Middleware enabled" (preview/prod only)
# - "✅ Rate Limiting Middleware enabled" (preview/prod only)

# 5. Verify Python version
railway run python --version
# Should see: Python 3.13.x

# 6. Check environment
railway variables
# Verify all required variables are set
```

---

## 🔧 Service Configuration

### Railway Service Settings

**For Each Environment**:

1. **General**
   - Service Name: `ai-engine-{env}`
   - Root Directory: `services/ai-engine`
   - Build Command: (auto-detected from Dockerfile)
   - Start Command: (uses Dockerfile CMD)

2. **Deploy**
   - Branch: `main` (or `dev`, `staging` for respective envs)
   - Auto-deploy: Enabled
   - Watch Paths: `services/ai-engine/**`

3. **Networking**
   - Generate Domain: Yes
   - Custom Domain: (optional)
   - Port: Railway auto-provides via $PORT

4. **Resources**
   - **Dev**: 2GB RAM, 2 vCPU
   - **Preview**: 4GB RAM, 2 vCPU
   - **Production**: 4GB RAM, 4 vCPU

5. **Health Check**
   - Path: `/health`
   - Interval: 30s
   - Timeout: 10s
   - Start Period: 60s

---

## 🚨 Rollback Strategy

### If Deployment Fails

```bash
# 1. Check logs
railway logs --tail 100

# 2. Rollback to previous deployment
railway rollback

# 3. Or redeploy specific commit
railway up --detach --commit <commit-hash>

# 4. If all else fails, redeploy from last known good state
git checkout <last-good-commit>
railway up
```

---

## 💰 Cost Breakdown

### Estimated Monthly Costs

**Dev Environment**:
- Railway: $20-30 (2GB RAM, moderate usage)
- OpenAI: $20-50 (dev key, testing)
- Supabase: Free tier or $25 (Pro)
- **Total**: $40-105/month

**Preview Environment**:
- Railway: $30-50 (4GB RAM, staging tests)
- OpenAI: $30-80 (shared prod key)
- Supabase: $25 (Pro) or shared with prod
- **Total**: $55-155/month

**Production Environment**:
- Railway: $50-100 (4GB RAM, 4 vCPU, high uptime)
- OpenAI: $100-300 (depends on usage)
- Supabase: $25-100 (Pro or Team)
- Pinecone: $0-70 (optional)
- **Total**: $175-570/month

**Grand Total**: $270-830/month for all 3 environments

**Cost Optimization Tips**:
- Use same Supabase for dev/preview (different schemas)
- Share OpenAI key between preview/prod (set lower limits for preview)
- Scale down dev environment when not in use

---

## 📚 Additional Configuration Files

See also:
- `railway.json` - Service configuration
- `railway.toml` - Build configuration  
- `.railway.env.dev` - Dev environment template
- `.railway.env.preview` - Preview environment template
- `.railway.env.production` - Production environment template

---

## 🎯 Quick Reference

### Switch Environments

```bash
railway environment dev        # Switch to dev
railway environment preview    # Switch to preview
railway environment production # Switch to production
```

### Deploy

```bash
railway up                     # Deploy current environment
railway up --detach           # Deploy without blocking
```

### Monitor

```bash
railway logs                   # Recent logs
railway logs --follow         # Live logs
railway logs --tail 100       # Last 100 lines
```

### Manage

```bash
railway status                 # Service status
railway variables             # List variables
railway variables set KEY=VAL  # Set variable
railway domain                # Get service URL
railway open                  # Open in browser
```

---

**Ready to deploy!** Follow the steps above to set up your 3-tier Railway deployment.

