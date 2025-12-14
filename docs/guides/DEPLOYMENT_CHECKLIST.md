# VITAL Platform - Production Deployment Checklist

**Version:** 1.0  
**Date:** December 14, 2025  
**Last Updated:** December 14, 2025  
**Target Platforms:** Vercel (Frontend) + Railway (Backend)  
**Purpose:** Step-by-step checklist for production deployment

---

## Pre-Deployment Requirements

### ✅ Prerequisites Checklist

- [ ] GitHub repository connected to Vercel project
- [ ] Railway account created and CLI installed
- [ ] Supabase project created with production database
- [ ] Environment variables documented and secured
- [ ] Domain names configured (frontend + backend)
- [ ] SSL certificates ready (handled by Vercel/Railway)
- [ ] Monitoring/alerting configured (optional but recommended)

---

## Phase 1: Pre-Deployment Verification

### ✅ Code Quality Checks

- [ ] All TypeScript errors resolved (`pnpm type-check`)
- [ ] All Python linting errors resolved (`ruff check`)
- [ ] All tests passing (frontend + backend)
- [ ] No console errors in browser console
- [ ] No deprecated dependencies in use
- [ ] Security vulnerabilities scanned (`pnpm audit`, `safety check`)

### ✅ File Tagging Verification

- [ ] All production files tagged with `PRODUCTION_READY` or `PRODUCTION_CORE`
- [ ] No `EXPERIMENTAL` or `STUB` files in production paths
- [ ] All `DEPRECATED` files removed or archived
- [ ] File registry updated (see `PRODUCTION_FILE_REGISTRY.md`)

**Tagging Standard:**
```typescript
// Frontend files: Add to top of file
/**
 * @production PRODUCTION_READY
 * @lastVerified 2025-12-14
 * @category feature
 */
```

```python
# Backend files: Add to top of file
# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# CATEGORY: api
```

---

## Phase 2: Frontend Deployment (Vercel)

### ✅ Pre-Deployment Setup

- [ ] Vercel project linked to GitHub repository
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Vercel project configured in dashboard
- [ ] Build settings verified in `vercel.json` (if exists)

### ✅ Environment Variables (Vercel)

Set in Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL (Railway)
- [ ] `NEXT_PUBLIC_APP_URL` - Frontend URL (for CORS)
- [ ] Any other `NEXT_PUBLIC_*` variables required

**Command to verify:**
```bash
cd apps/vital-system
vercel env ls
```

### ✅ Build Configuration

- [ ] `next.config.mjs` configured correctly
- [ ] `package.json` build script works locally
- [ ] TypeScript compilation succeeds (`pnpm build`)
- [ ] No build warnings or errors
- [ ] Output directory correct (`.next`)

**Test build locally:**
```bash
cd apps/vital-system
pnpm build
```

### ✅ Vercel Configuration File

Create/verify `apps/vital-system/vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-url.railway.app/api/:path*"
    }
  ]
}
```

- [ ] `vercel.json` created/verified
- [ ] Build command correct
- [ ] API rewrites configured (if needed)

### ✅ Deploy to Preview

```bash
cd apps/vital-system
vercel
```

- [ ] Preview deployment successful
- [ ] Preview URL accessible
- [ ] All pages load correctly
- [ ] API routes work (if any)
- [ ] No console errors
- [ ] Authentication flow works
- [ ] Database connections work

### ✅ Deploy to Production

```bash
cd apps/vital-system
vercel --prod
```

- [ ] Production deployment successful
- [ ] Production URL accessible
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Health check endpoint works: `https://your-domain.vercel.app/api/health`

### ✅ Post-Deployment Verification (Frontend)

- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] Authentication works
- [ ] API calls to backend succeed
- [ ] Error pages display correctly (404, 500)
- [ ] Analytics/monitoring active (if configured)
- [ ] Performance metrics acceptable (Lighthouse score > 80)

---

## Phase 3: Backend Deployment (Railway)

### ✅ Pre-Deployment Setup

- [ ] Railway CLI installed (`npm i -g @railway/cli`)
- [ ] Railway account created
- [ ] Railway project created
- [ ] Railway service created for `ai-engine`

### ✅ Railway Configuration

Create/verify `services/ai-engine/railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn src.api.main:app --host 0.0.0.0 --port $PORT --workers 2"
healthcheckPath = "/health"
healthcheckTimeout = 100

[[deploy.envs]]
PORT = "$PORT"
```

- [ ] `railway.toml` created/verified
- [ ] Start command correct
- [ ] Health check path configured

### ✅ Dockerfile Verification

Verify `services/ai-engine/Dockerfile` exists and is correct:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY pyproject.toml .

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

- [ ] Dockerfile exists
- [ ] Python version correct (3.11+)
- [ ] Dependencies installed correctly
- [ ] Source code copied correctly
- [ ] Port exposed correctly
- [ ] Start command correct

### ✅ Environment Variables (Railway)

Set in Railway Dashboard → Variables:

**Required:**
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key (if used)
- [ ] `PORT` - Server port (Railway sets this automatically)

**Optional but Recommended:**
- [ ] `REDIS_URL` - Redis connection string (for caching)
- [ ] `ENVIRONMENT` - `production`
- [ ] `LOG_LEVEL` - `INFO` or `WARNING`
- [ ] `CORS_ORIGINS` - Frontend URL(s)

**Command to verify:**
```bash
cd services/ai-engine
railway variables
```

### ✅ Deploy to Railway

```bash
cd services/ai-engine
railway up
```

- [ ] Build successful
- [ ] Deployment successful
- [ ] Service running
- [ ] Health check passing

### ✅ Post-Deployment Verification (Backend)

**Health Check:**
```bash
curl https://your-service.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-12-14T12:00:00Z"
}
```

- [ ] Health endpoint responds correctly
- [ ] API documentation accessible: `https://your-service.railway.app/docs`
- [ ] All API routes accessible
- [ ] Database connections work
- [ ] LLM API calls work (test with simple request)
- [ ] CORS configured correctly (frontend can call backend)
- [ ] Logs accessible in Railway dashboard

---

## Phase 4: Database Setup (Supabase)

### ✅ Migrations

- [ ] All migrations applied to production database
- [ ] Migration scripts tested in staging first
- [ ] Rollback plan documented (if needed)

**Apply migrations:**
```bash
# Option 1: Via Supabase CLI
npx supabase db push

# Option 2: Via SQL Editor in Supabase Dashboard
# Copy migration SQL and run in SQL Editor
```

### ✅ RLS Policies

- [ ] All RLS policies applied
- [ ] Policies tested with test users
- [ ] Tenant isolation verified

**Verify policies:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test tenant isolation
-- (Run as different users)
```

### ✅ Seed Data (if needed)

- [ ] Production seed data applied
- [ ] No test data in production
- [ ] Initial admin user created (if needed)

---

## Phase 5: Integration & Testing

### ✅ Frontend-Backend Integration

- [ ] Frontend can call backend API
- [ ] CORS configured correctly
- [ ] Authentication tokens passed correctly
- [ ] SSE streaming works (if used)
- [ ] WebSocket connections work (if used)

**Test API call from frontend:**
```typescript
// In browser console on production frontend
fetch('https://your-backend.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

### ✅ End-to-End Testing

- [ ] User registration/login works
- [ ] Core features work (Ask Expert, Ask Panel, etc.)
- [ ] Data persistence works
- [ ] File uploads work (if applicable)
- [ ] Real-time features work (if applicable)

### ✅ Performance Testing

- [ ] Page load times acceptable (< 3s)
- [ ] API response times acceptable (< 500ms for simple requests)
- [ ] No memory leaks
- [ ] No excessive API calls

---

## Phase 6: Monitoring & Alerts

### ✅ Monitoring Setup

- [ ] Vercel Analytics enabled (if using)
- [ ] Railway metrics dashboard accessible
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)

### ✅ Alert Configuration

- [ ] Error alerts configured
- [ ] Uptime alerts configured
- [ ] Performance alerts configured (if applicable)
- [ ] Team notified of alert channels

---

## Phase 7: Documentation & Handoff

### ✅ Documentation Updated

- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide updated
- [ ] Runbooks updated (if applicable)

### ✅ Team Handoff

- [ ] Team notified of deployment
- [ ] Access credentials shared (securely)
- [ ] Monitoring dashboards shared
- [ ] On-call rotation configured (if applicable)

---

## Rollback Procedure

If deployment fails:

### Frontend (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

### Backend (Railway)
1. Go to Railway Dashboard → Deployments
2. Find previous successful deployment
3. Click "Redeploy"

### Database
- [ ] Rollback migrations (if needed)
- [ ] Restore from backup (if data corrupted)

---

## Post-Deployment Checklist (First 24 Hours)

- [ ] Monitor error rates (should be < 1%)
- [ ] Monitor response times (should be stable)
- [ ] Check user feedback (if applicable)
- [ ] Verify all critical features work
- [ ] Check logs for any warnings/errors
- [ ] Verify backups are running (database)
- [ ] Document any issues encountered

---

## Quick Reference Commands

### Frontend (Vercel)
```bash
# Preview deployment
cd apps/vital-system
vercel

# Production deployment
vercel --prod

# Check environment variables
vercel env ls

# View logs
vercel logs
```

### Backend (Railway)
```bash
# Deploy
cd services/ai-engine
railway up

# Check status
railway status

# View logs
railway logs

# Check variables
railway variables
```

### Database (Supabase)
```bash
# Apply migrations
npx supabase db push

# Check connection
npx supabase db ping
```

---

## Troubleshooting

### Frontend Issues

**Build fails:**
- Check TypeScript errors: `pnpm type-check`
- Check for missing dependencies
- Verify `next.config.mjs` is correct

**Environment variables not working:**
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding new variables
- Check variable names match code

### Backend Issues

**Deployment fails:**
- Check Dockerfile syntax
- Verify all dependencies in `requirements.txt`
- Check Railway logs for specific errors

**Health check fails:**
- Verify `/health` endpoint exists
- Check server is binding to `0.0.0.0`
- Verify port is `$PORT` (Railway sets this)

**Database connection fails:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active
- Verify network connectivity

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2025  
**Maintained By:** Platform Team

---

## Related Documents

- [FILE_ORGANIZATION_STANDARD.md](../architecture/FILE_ORGANIZATION_STANDARD.md) - File tagging and organization
- [PRODUCTION_FILE_REGISTRY.md](../architecture/PRODUCTION_FILE_REGISTRY.md) - Production file registry
- [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](../architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) - Architecture reference
