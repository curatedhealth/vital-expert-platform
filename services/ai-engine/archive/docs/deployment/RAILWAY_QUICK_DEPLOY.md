# 🚂 Railway Quick Deploy Guide

## ⚡ TL;DR - Deploy in 5 Minutes

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate to AI Engine
cd services/ai-engine

# 4. Link or create project
railway link
# Or create new: railway init

# 5. Set environment variables (required)
railway variables set OPENAI_API_KEY="sk-..."
railway variables set SUPABASE_URL="https://your-project.supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your-key"
railway variables set DATABASE_URL="postgresql://..."
railway variables set ENV="production"
railway variables set CORS_ORIGINS="https://your-frontend.com"
railway variables set PLATFORM_TENANT_ID="550e8400-e29b-41d4-a716-446655440000"

# 6. Deploy!
railway up

# 7. Check deployment
railway logs
```

## 🔐 Required Environment Variables

Copy these to Railway Variables tab:

```bash
OPENAI_API_KEY=sk-your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres
ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-app.com
PLATFORM_TENANT_ID=550e8400-e29b-41d4-a716-446655440000
LOG_LEVEL=info
PYTHONUNBUFFERED=1
```

## ✅ Post-Deployment Checklist

```bash
# 1. Get your Railway URL
railway domain

# 2. Test health endpoint
curl https://your-service.railway.app/health

# Expected: {"status": "healthy", "ready": true, ...}

# 3. Watch logs
railway logs --follow

# Expected logs:
# ✅ "VITAL Path AI Services"
# ✅ "Tenant Isolation Middleware enabled (production mode)"
# ✅ "Rate Limiting Middleware enabled (production mode)"
# ✅ "FastAPI app ready"

# 4. Test API endpoint
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
```

## 🔧 Add Optional Services

### Redis (Recommended)
```bash
# In Railway Dashboard:
# 1. Click "New" → "Database" → "Redis"
# 2. Name it "Redis"
# 3. In AI Engine variables, add:
railway variables set REDIS_URL='${{Redis.REDIS_URL}}'
```

### PostgreSQL (If not using Supabase)
```bash
# In Railway Dashboard:
# 1. Click "New" → "Database" → "PostgreSQL"
# 2. Name it "Postgres"
# 3. In AI Engine variables, add:
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
```

## 🚨 Troubleshooting

### Build fails?
```bash
# Clear cache and rebuild
railway run --clear-cache
railway up --force
```

### Can't connect to services?
```bash
# Check logs
railway logs

# Verify environment variables
railway variables

# Test locally
railway run python start.py
```

### Health check fails?
- Ensure `/health` endpoint responds in <10s
- Check memory limits (need 2GB+)
- Verify PORT is not manually set (Railway sets it)

## 📊 Monitor Your Deployment

```bash
# Real-time logs
railway logs --follow

# Service info
railway status

# Resource usage
railway metrics

# Open in browser
railway open
```

## 💰 Expected Costs

- **Railway Hobby**: $5/month (500 hours) - Perfect for testing
- **Railway Pro**: $20/month (unlimited) - For production
- **Estimated Total**: $30-50/month including compute
- **OpenAI API**: ~$0.03-0.06 per request (GPT-4)

## 🔒 Security Checklist

After deployment, verify:

```bash
# 1. Check security middleware enabled
railway logs | grep "Tenant Isolation"
# Should see: "✅ Tenant Isolation Middleware enabled"

railway logs | grep "Rate Limiting"
# Should see: "✅ Rate Limiting Middleware enabled"

# 2. Test CORS
curl -H "Origin: https://evil.com" https://your-service.railway.app/health
# Should block if evil.com not in CORS_ORIGINS

# 3. Verify HTTPS
curl -I https://your-service.railway.app/health
# Should see: "HTTP/2 200"
```

## 📝 Update Deployment

```bash
# After making changes:
git add .
git commit -m "Update AI Engine"
git push

# Railway auto-deploys on push, or manually:
railway up
```

## 🎯 Complete Documentation

For full details, read:
- **RAILWAY_DEPLOYMENT_AUDIT.md** - Complete audit report
- **railway.env.template** - All environment variables
- **Dockerfile** - Build configuration

---

**Questions?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

