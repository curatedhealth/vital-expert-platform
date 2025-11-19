# 🚀 Ask Panel Frontend Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended) ⚡

**Why Vercel:**
- Built for Next.js
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Preview deployments

#### Quick Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from the ask-panel directory
cd apps/ask-panel
vercel

# 4. Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? vital-ask-panel
# - Directory? ./
# - Override settings? No

# 5. Deploy to production
vercel --prod
```

#### Configure Environment Variables

After deployment, add these in Vercel Dashboard:

```bash
# Go to: https://vercel.com/your-account/vital-ask-panel/settings/environment-variables

# Add these variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_API_URL=https://api.vital.ai
NEXT_PUBLIC_AI_ENGINE_URL=https://ai-engine.vital.ai
NEXT_PUBLIC_APP_URL=https://panels.vital.ai
```

#### Configure Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain: `panels.vital.ai`
3. Update DNS records as instructed
4. Vercel auto-provisions SSL

---

### Option 2: Railway 🚂

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd apps/ask-panel
railway init

# 4. Deploy
railway up

# 5. Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# ... add all other variables

# 6. Configure domain
railway domain
```

---

### Option 3: Docker + Any Platform 🐳

```dockerfile
# Dockerfile already created at apps/ask-panel/Dockerfile

# Build and deploy
docker build -t ask-panel .
docker push your-registry/ask-panel
# Deploy to your platform (AWS, GCP, Azure, etc.)
```

---

## Pre-Deployment Checklist

### 1. Environment Variables ✅
```bash
[ ] NEXT_PUBLIC_SUPABASE_URL
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] SUPABASE_SERVICE_ROLE_KEY
[ ] NEXT_PUBLIC_API_URL
[ ] NEXT_PUBLIC_AI_ENGINE_URL
[ ] NEXT_PUBLIC_APP_URL
```

### 2. Backend Services ✅
```bash
[ ] FastAPI backend deployed
[ ] AI Engine accessible
[ ] Supabase database configured
[ ] CORS enabled for frontend domain
```

### 3. Database Setup ✅
```bash
[ ] RLS policies enabled
[ ] Test tenant created
[ ] Tables have proper indexes
[ ] Backup strategy in place
```

### 4. Security ✅
```bash
[ ] HTTPS enabled
[ ] Environment variables secure
[ ] CORS properly configured
[ ] Rate limiting enabled (backend)
[ ] Monitoring configured
```

---

## One-Click Deploy

### Deploy to Vercel (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/vital-platform&project-name=ask-panel&root-directory=apps/ask-panel)

---

## Post-Deployment Steps

### 1. Verify Deployment
```bash
# Test the deployment
curl https://panels.vital.ai

# Should return the Next.js app
```

### 2. Test Panel Creation
```bash
# Login to the frontend
# Create a test panel
# Verify real-time streaming works
```

### 3. Configure Monitoring
```bash
# Vercel automatically provides:
- Analytics
- Error tracking
- Performance metrics

# Access at: https://vercel.com/your-account/vital-ask-panel/analytics
```

### 4. Set Up Custom Domain
```bash
# Add DNS records:
panels.vital.ai → CNAME → cname.vercel-dns.com

# Vercel will auto-provision SSL certificate
```

---

## Deployment Commands Reference

### Build Locally (Test before deploy)
```bash
cd apps/ask-panel

# Build production bundle
pnpm build

# Test production build locally
pnpm start

# Access: http://localhost:3002
```

### Deploy to Vercel
```bash
# Development preview
vercel

# Production deployment
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

### Environment Management
```bash
# Pull environment variables
vercel env pull

# Add new variable
vercel env add VARIABLE_NAME

# Remove variable
vercel env rm VARIABLE_NAME
```

---

## Subdomain Configuration

### For Multi-Tenant Subdomains

**Vercel:**
1. Configure wildcard domain: `*.vital.ai`
2. Add CNAME: `* → cname.vercel-dns.com`
3. Middleware handles routing automatically

**Example:**
- `acme.vital.ai` → Tenant: acme
- `pharma.vital.ai` → Tenant: pharma

---

## Monitoring & Analytics

### Built-in (Vercel)
- Real-time analytics
- Performance insights
- Error tracking
- Build logs

### Optional Integrations
```bash
# Sentry (Error tracking)
npm i @sentry/nextjs
vercel env add NEXT_PUBLIC_SENTRY_DSN

# PostHog (Analytics)
npm i posthog-js
vercel env add NEXT_PUBLIC_POSTHOG_KEY
```

---

## Rollback Strategy

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote a specific deployment
vercel promote [deployment-url]
```

---

## CI/CD Setup (Optional)

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Ask Panel
on:
  push:
    branches: [main]
    paths:
      - 'apps/ask-panel/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm i -g vercel
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Troubleshooting

### Build Fails
```bash
# Check build logs
vercel logs

# Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies
```

### Runtime Errors
```bash
# Check function logs
vercel logs --follow

# Common issues:
- Supabase connection
- Backend API unreachable
- CORS errors
```

### Performance Issues
```bash
# Analyze bundle size
pnpm build --analyze

# Check Core Web Vitals in Vercel dashboard
```

---

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Backend services deployed
- [ ] Database migrations run
- [ ] Test tenant created
- [ ] End-to-end test passed
- [ ] Monitoring configured
- [ ] Backup strategy active
- [ ] Team access configured

---

## Support

**Vercel Documentation:**
- https://vercel.com/docs

**Next.js Deployment:**
- https://nextjs.org/docs/deployment

**Need Help?**
- Check Vercel deployment logs
- Review this deployment guide
- Check QUICKSTART.md for setup issues

---

**Status**: Ready to deploy! 🚀

Choose your deployment method above and follow the steps!

