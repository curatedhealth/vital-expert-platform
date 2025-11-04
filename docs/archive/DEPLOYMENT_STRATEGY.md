# VITAL Expert - Deployment Strategy & Optimization

## Executive Summary

This document outlines the optimized 3-tier deployment strategy for VITAL Expert platform, covering Pre-Production (Dev), Preview, and Production environments with separate frontend and backend configurations.

## Current Architecture Analysis

### Repository Structure

```
VITAL Expert (Monorepo)
├── Root Project (Frontend - Next.js 14)
│   ├── src/                      # Main application code
│   ├── app/                      # Next.js App Router
│   ├── public/                   # Static assets
│   ├── package.json              # Main dependencies
│   └── vercel.json               # Deployment config
│
├── apps/
│   ├── frontend/                 # Workspace frontend (duplicate of root)
│   ├── python-services/          # Python backend services
│   └── node-gateway.disabled/    # Disabled Node.js gateway
│
├── standalone-apps/              # Independent apps (not in workspace)
│   ├── pharma-app/
│   ├── payers-app/
│   └── digital-health-app/
│
├── database/                     # Database migrations & seeds
└── scripts/                      # Deployment & maintenance scripts
```

### Workspace Configuration (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'python-packages/*'
```

**Note**: Only `apps/*` exists. `packages/*` and `python-packages/*` directories do not exist.

### Existing Git Branches

- `main` - Production stable
- `pre-production` - Pre-production environment
- `preview-deployment` - Preview/staging environment
- `feature/*` - Feature development branches

## Key Issues & Optimization Opportunities

### 1. **Duplicate Frontend Structure**
- ❌ Root project contains full Next.js app
- ❌ `apps/frontend/` contains duplicate of root
- ⚠️ This causes confusion and wastes deployment resources

**Recommendation**:
- Remove `apps/frontend/` completely
- Use root project as single source of truth for frontend
- Update `pnpm-workspace.yaml` to remove `apps/*` since only disabled services remain

### 2. **Missing Backend Services Structure**
- ❌ No clear API backend project
- ❌ Python services exist but aren't deployed
- ❌ Node gateway is disabled

**Recommendation**:
- Create `apps/api-backend/` for dedicated API services
- Or extract API routes to separate project for scalability
- Enable Python services deployment if needed

### 3. **Standalone Apps Not in Workspace**
- The 3 standalone apps are **not part of the monorepo workspace**
- They should either be included or removed

### 4. **Vercel Configuration**
- Current `vercel.json` treats everything as a single Next.js deployment
- No separation between frontend and backend
- No environment-specific configurations

## Proposed 3-Tier Deployment Strategy

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      VITAL Expert                            │
│                   Multi-Environment Setup                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PRODUCTION     │  │  PRE-PRODUCTION  │  │     PREVIEW      │
│                  │  │       (Dev)      │  │    (Staging)     │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Branch: main     │  │ Branch: pre-prod │  │ Branch: preview  │
│ Domain: app.com  │  │ Domain: dev.com  │  │ Domain: pr-*.com │
│ DB: Production   │  │ DB: Dev Instance │  │ DB: Preview DB   │
│ Cache: Prod Redis│  │ Cache: Dev Redis │  │ Cache: Shared    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         ↓                     ↓                       ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   FRONTEND       │  │   FRONTEND       │  │   FRONTEND       │
│   Vercel/Next.js │  │   Vercel/Next.js │  │   Vercel/Next.js │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         ↓                     ↓                       ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   BACKEND API    │  │   BACKEND API    │  │   BACKEND API    │
│   (Embedded in   │  │   (Embedded in   │  │   (Embedded in   │
│    Next.js API   │  │    Next.js API   │  │    Next.js API   │
│     Routes)      │  │     Routes)      │  │     Routes)      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Environment Configuration

#### 1. **Production Environment**

**Branch**: `main`
**Domain**: `vital-expert.vercel.app` (or custom domain)
**Purpose**: Live production system for end users
**Deployment**: Automatic on push to `main`

**Configuration**:
```json
{
  "vercel.json": {
    "version": 2,
    "framework": "nextjs",
    "regions": ["iad1"],
    "env": {
      "NODE_ENV": "production",
      "NEXT_PUBLIC_ENV": "production",
      "NEXT_PUBLIC_SUPABASE_URL": "@production-supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@production-supabase-anon",
      "SUPABASE_SERVICE_ROLE_KEY": "@production-supabase-service",
      "OPENAI_API_KEY": "@production-openai-key",
      "UPSTASH_REDIS_REST_URL": "@production-redis-url",
      "UPSTASH_REDIS_REST_TOKEN": "@production-redis-token"
    },
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  }
}
```

**Features**:
- Full security policies enabled
- Rate limiting: 100 req/15min per IP
- Database: Production Supabase instance
- Monitoring: Full LangFuse tracing enabled
- Caching: Production Redis instance
- CDN: Global edge caching

#### 2. **Pre-Production (Dev) Environment**

**Branch**: `pre-production`
**Domain**: `vital-expert-dev.vercel.app`
**Purpose**: Internal development and testing before production
**Deployment**: Automatic on push to `pre-production`

**Configuration**:
```json
{
  "vercel.json": {
    "version": 2,
    "framework": "nextjs",
    "regions": ["iad1"],
    "env": {
      "NODE_ENV": "development",
      "NEXT_PUBLIC_ENV": "pre-production",
      "NEXT_PUBLIC_ENABLE_DEBUG": "true",
      "NEXT_PUBLIC_ENABLE_MOCK_API": "true",
      "NEXT_PUBLIC_SUPABASE_URL": "@dev-supabase-url",
      "OPENAI_API_KEY": "@dev-openai-key"
    },
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 60
      }
    },
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
        ]
      }
    ]
  }
}
```

**Features**:
- Relaxed security for testing
- Debug mode enabled
- Mock API available for rapid development
- Database: Separate dev Supabase instance
- Monitoring: Verbose logging enabled
- No search engine indexing

#### 3. **Preview (Staging) Environment**

**Branch**: `preview-deployment` (and all PR branches)
**Domain**: Dynamic `vital-expert-{pr-number}.vercel.app`
**Purpose**: Feature testing and stakeholder reviews
**Deployment**: Automatic on PR creation/update

**Configuration**:
```json
{
  "vercel.json": {
    "version": 2,
    "framework": "nextjs",
    "regions": ["iad1"],
    "env": {
      "NODE_ENV": "preview",
      "NEXT_PUBLIC_ENV": "preview",
      "NEXT_PUBLIC_ENABLE_DEBUG": "false",
      "NEXT_PUBLIC_SUPABASE_URL": "@preview-supabase-url"
    },
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 45
      }
    },
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Robots-Tag", "value": "noindex" },
          { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
        ]
      }
    ]
  }
}
```

**Features**:
- Production-like configuration
- Shared preview database
- Automatic cleanup after 30 days
- Branch-based deployment URLs
- Suitable for client demos

## Recommended Repository Restructuring

### Option A: Keep Monorepo (Recommended)

**New Structure**:
```
vital-expert/
├── src/                           # Frontend application
├── app/                           # Next.js App Router
├── public/                        # Static assets
├── database/                      # Database migrations
├── scripts/                       # Scripts
├── vercel.json                    # Main deployment config
├── vercel.production.json         # Production overrides
├── vercel.pre-production.json     # Pre-prod overrides
├── vercel.preview.json            # Preview overrides
├── package.json                   # Root dependencies
└── pnpm-workspace.yaml            # Remove or simplify
```

**Changes**:
1. Remove `apps/frontend/` (duplicate)
2. Remove `pnpm-workspace.yaml` if no workspace packages
3. Keep API routes in `src/app/api/` (Next.js API routes)
4. Create environment-specific Vercel configs
5. Move or archive `standalone-apps/` if not needed

### Option B: Separate Repositories (For Scale)

**If backend needs to scale independently**:

```
vital-expert-frontend/             # Next.js frontend
├── src/
├── app/
├── vercel.json
└── package.json

vital-expert-api/                  # Standalone API (Node.js/Express)
├── src/
├── routes/
├── services/
└── package.json
```

## Deployment Workflow

### Git Branch Strategy

```
main (production)
  ↑
  └── pre-production (dev)
        ↑
        └── preview-deployment (staging)
              ↑
              └── feature/* branches
```

**Workflow**:
1. Developer creates `feature/new-feature` branch
2. PR triggers **Preview** deployment automatically
3. After review, merge to `preview-deployment` for staging testing
4. After QA, merge to `pre-production` for internal validation
5. After final approval, merge to `main` for production release

### Vercel Project Configuration

#### Current Setup
- Single Vercel project linked to `main` branch
- All branches deploy to same project

#### Recommended Setup

**Create 3 Separate Vercel Projects**:

1. **vital-expert-production**
   - Branch: `main` only
   - Custom domain: `app.vitalexpert.com`
   - Production environment variables

2. **vital-expert-dev**
   - Branch: `pre-production` only
   - Custom domain: `dev.vitalexpert.com`
   - Development environment variables

3. **vital-expert-preview**
   - All PR branches
   - Dynamic subdomains: `pr-123.vitalexpert.com`
   - Preview environment variables

**Benefits**:
- Isolated environments
- Separate environment variables
- Independent scaling
- Better cost tracking
- No accidental production overwrites

## Implementation Steps

### Phase 1: Repository Cleanup (Week 1)

```bash
# 1. Backup current state
git checkout -b backup-before-restructure
git push origin backup-before-restructure

# 2. Clean up duplicate frontend
git checkout main
rm -rf apps/frontend
git commit -m "refactor: remove duplicate frontend directory"

# 3. Update pnpm-workspace.yaml or remove it
# If keeping: update to only reference needed packages
# If removing: delete file if no workspace packages exist

# 4. Push changes
git push origin main
```

### Phase 2: Create Environment-Specific Configs (Week 1)

**Create `vercel.production.json`**:
```json
{
  "version": 2,
  "extends": "./vercel.json",
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

**Create `vercel.pre-production.json`**:
```json
{
  "version": 2,
  "extends": "./vercel.json",
  "env": {
    "NODE_ENV": "development",
    "NEXT_PUBLIC_ENV": "pre-production",
    "NEXT_PUBLIC_ENABLE_DEBUG": "true"
  }
}
```

**Create `vercel.preview.json`**:
```json
{
  "version": 2,
  "extends": "./vercel.json",
  "env": {
    "NODE_ENV": "preview",
    "NEXT_PUBLIC_ENV": "preview"
  }
}
```

### Phase 3: Setup Vercel Projects (Week 2)

**Via Vercel Dashboard**:

1. Go to [vercel.com/new](https://vercel.com/new)

2. Create **Production Project**:
   - Name: `vital-expert-production`
   - Framework: Next.js
   - Root Directory: `/`
   - Branch: `main` only
   - Environment Variables: Add all production secrets
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `.next`

3. Create **Pre-Production Project**:
   - Name: `vital-expert-dev`
   - Framework: Next.js
   - Root Directory: `/`
   - Branch: `pre-production` only
   - Environment Variables: Add all dev secrets
   - Build Command: `pnpm install && pnpm build`

4. Create **Preview Project**:
   - Name: `vital-expert-preview`
   - Framework: Next.js
   - Root Directory: `/`
   - Branches: All branches except `main` and `pre-production`
   - Environment Variables: Add preview secrets
   - Auto-delete after: 30 days

**Via Vercel CLI**:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to production project
vercel link --project vital-expert-production

# Deploy to production
vercel --prod --yes

# Deploy to pre-production
git checkout pre-production
vercel --yes

# Deploy preview
git checkout feature/new-feature
vercel --yes
```

### Phase 4: Environment Variables Setup (Week 2)

**Production Secrets** (via Vercel Dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=https://production.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
OPENAI_API_KEY=sk-prod-xxx
UPSTASH_REDIS_REST_URL=https://prod-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod_token
NEXT_PUBLIC_ENV=production
```

**Pre-Production Secrets**:
```
NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_key
OPENAI_API_KEY=sk-dev-xxx
UPSTASH_REDIS_REST_URL=https://dev-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=dev_token
NEXT_PUBLIC_ENV=pre-production
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

**Preview Secrets**:
```
NEXT_PUBLIC_SUPABASE_URL=https://preview.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=preview_anon_key
SUPABASE_SERVICE_ROLE_KEY=preview_service_key
OPENAI_API_KEY=sk-preview-xxx
NEXT_PUBLIC_ENV=preview
```

### Phase 5: Update CI/CD Workflows (Week 3)

**Create `.github/workflows/deploy-production.yml`**:
```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test:ci

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
          vercel-args: '--prod'
```

**Create `.github/workflows/deploy-pre-production.yml`**:
```yaml
name: Deploy to Pre-Production

on:
  push:
    branches:
      - pre-production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_DEV }}
```

**Create `.github/workflows/deploy-preview.yml`**:
```yaml
name: Deploy Preview

on:
  pull_request:
    branches:
      - main
      - pre-production
      - preview-deployment

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PREVIEW }}

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Preview deployment ready at: ${{ steps.vercel.outputs.preview-url }}'
            })
```

### Phase 6: Database Strategy (Week 3-4)

**Recommended Setup**:

1. **Production Database**:
   - Supabase Production project
   - Daily backups enabled
   - Point-in-time recovery
   - Connection pooling: 100 connections

2. **Pre-Production Database**:
   - Separate Supabase Dev project
   - Weekly backups
   - Seeded with anonymized production data
   - Connection pooling: 50 connections

3. **Preview Database**:
   - Shared Supabase Preview project
   - Daily cleanup of old data
   - Seeded with minimal test data
   - Connection pooling: 25 connections

**Migration Strategy**:
```bash
# Production migrations (manual trigger only)
pnpm migrate:production

# Pre-production migrations (automatic)
pnpm migrate:pre-production

# Preview migrations (automatic)
pnpm migrate:preview
```

## Monitoring & Observability

### Vercel Analytics

**Production**:
- Real User Monitoring (RUM) enabled
- Web Vitals tracking
- Error boundaries with Sentry
- LangFuse AI tracing

**Pre-Production**:
- Verbose logging enabled
- Performance profiling
- API response timing

**Preview**:
- Basic metrics only
- Error logging

### Cost Optimization

**Recommendations**:

1. **Function Execution Limits**:
   - Production: 30s max
   - Pre-production: 60s max (for debugging)
   - Preview: 45s max

2. **Edge Caching**:
   - Static assets: Cache-Control: public, max-age=31536000, immutable
   - API routes: Cache-Control: no-cache, no-store
   - SSR pages: Cache-Control: s-maxage=60, stale-while-revalidate

3. **Build Optimization**:
   - Enable Vercel build cache
   - Use pnpm for faster installs
   - Parallel builds where possible

## Security Considerations

### Production
- ✅ HTTPS only
- ✅ Rate limiting (100/15min)
- ✅ CORS restricted to known origins
- ✅ CSP headers enabled
- ✅ Secret rotation every 90 days
- ✅ Row-level security on all DB tables

### Pre-Production
- ✅ HTTPS only
- ✅ Rate limiting (500/15min)
- ✅ IP allowlist for admin routes
- ✅ Debug mode allowed
- ⚠️ Mock data allowed

### Preview
- ✅ HTTPS only
- ✅ No indexing (robots: noindex)
- ⚠️ Open CORS for testing
- ⚠️ Relaxed rate limits

## Rollback Strategy

### Production Rollback

**Immediate Rollback**:
```bash
# Revert to previous deployment via Vercel dashboard
# Or via CLI:
vercel rollback https://vital-expert-production-xxx.vercel.app
```

**Git Rollback**:
```bash
git checkout main
git revert HEAD~1  # Revert last commit
git push origin main  # Triggers new deployment
```

### Database Rollback

**Production**:
```bash
# Restore from backup (manual process)
# Contact Supabase support or use dashboard

# Or run rollback migration
pnpm migrate:rollback --env production
```

## Success Metrics

**Deployment Velocity**:
- Production deployments: 1-2 per week
- Pre-production deployments: 5-10 per week
- Preview deployments: 20-50 per week

**Performance**:
- Production uptime: > 99.9%
- API response time: < 500ms p95
- Build time: < 5 minutes
- Cold start time: < 2 seconds

**Cost**:
- Vercel costs: < $200/month total
- Supabase costs: < $100/month total
- Redis costs: < $50/month total

## Next Steps

1. ✅ Fix TypeScript errors (DONE)
2. 🔄 Clean up repository structure
3. 🔄 Create environment-specific configs
4. 📋 Setup 3 Vercel projects
5. 📋 Configure environment variables
6. 📋 Setup GitHub Actions workflows
7. 📋 Configure database instances
8. 📋 Test deployment pipeline
9. 📋 Document for team
10. 📋 Train team on new workflow

## Conclusion

This 3-tier deployment strategy provides:

✅ **Clear separation** between production, development, and preview environments
✅ **Independent scaling** for each environment
✅ **Cost optimization** through proper resource allocation
✅ **Security** through environment-specific configurations
✅ **Developer velocity** through automated preview deployments
✅ **Production safety** through multi-stage validation

**Estimated Implementation Time**: 3-4 weeks
**Team Size Required**: 1-2 developers
**Risk Level**: Medium (requires careful migration planning)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Author**: Claude (AI Assistant)
**Status**: Ready for Review
