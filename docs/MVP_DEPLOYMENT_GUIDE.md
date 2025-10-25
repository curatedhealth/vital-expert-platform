# VITAL Digital Health - MVP Deployment Guide

This guide provides step-by-step instructions to deploy the **digital-health-startup** app as the MVP for VITAL Platform.

## 📋 Prerequisites

- [x] Monorepo restructure completed
- [x] Shared packages extracted (@vital/ui, @vital/sdk, @vital/config, @vital/utils)
- [x] Import paths updated to use @vital/* packages
- [ ] Build errors fixed
- [ ] Vercel account with access
- [ ] Environment variables configured

## 🏗️ Current Monorepo Structure

```
vital-platform/
├── apps/
│   ├── digital-health-startup/    ← MVP FOCUS
│   ├── consulting/                 (placeholder)
│   ├── pharma/                     (placeholder)
│   └── payers/                     (placeholder)
├── packages/
│   ├── ui/                         ✅ 40 components
│   ├── sdk/                        ✅ Backend integration
│   ├── config/                     ✅ Shared configs
│   └── utils/                      ✅ Helper functions
└── services/
    └── ai-engine/                  ✅ Python FastAPI
```

## 🔧 Pre-Deployment Fixes Required

### 1. Fix Build Errors

Current build has 3 issues to fix:

#### Issue 1: Missing Dependency
```bash
cd apps/digital-health-startup
pnpm add react-countup
```

#### Issue 2: Syntax Error in `EnhancedChatInterface.tsx`
**File**: `apps/digital-health-startup/src/components/enhanced/EnhancedChatInterface.tsx:107`

**Error**: Expression expected after `useCallback` dependencies array

**Fix**: Review the callback function and ensure proper syntax.

#### Issue 3: Syntax Error in `AgentRagAssignments.tsx`
**File**: `apps/digital-health-startup/src/components/rag/AgentRagAssignments.tsx:57`

**Error**: Expression expected in callback parameter

**Fix**: Review arrow function parameters syntax.

### 2. Environment Variables

Create `.env.local` in `apps/digital-health-startup/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=vital-knowledge

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Langfuse (Monitoring)
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com

# App Config
NEXT_PUBLIC_APP_URL=https://digital-health.vital-platform.com
TENANT_ID=digital-health-startup
```

## 🚀 Deployment Steps

### Option A: Deploy from Monorepo Root (Recommended)

```bash
# 1. Ensure you're on the restructure branch
git checkout restructure/world-class-architecture

# 2. Install all dependencies
pnpm install

# 3. Build the digital-health app
cd apps/digital-health-startup
pnpm build

# 4. Test locally
pnpm start
# Open http://localhost:3000

# 5. Deploy to Vercel
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. **Create New Project**
   - Go to https://vercel.com/new
   - Import from GitHub: `curatedhealth/vital-expert-platform`
   - Select branch: `restructure/world-class-architecture`

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: apps/digital-health-startup
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

3. **Add Environment Variables**
   - Copy all variables from `.env.local`
   - Add to Vercel project settings

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get deployment URL

## 📦 Package Dependencies

The digital-health app uses these workspace packages:

```json
{
  "dependencies": {
    "@vital/ui": "workspace:*",
    "@vital/sdk": "workspace:*",
    "@vital/utils": "workspace:*"
  }
}
```

Vercel automatically installs workspace dependencies via pnpm.

## 🔍 Verification Checklist

After deployment:

- [ ] Homepage loads successfully
- [ ] Authentication works (login/register)
- [ ] Dashboard displays agents
- [ ] Chat functionality works
- [ ] Ask Expert feature accessible
- [ ] API routes respond correctly
- [ ] Database connections work
- [ ] Langfuse monitoring active

## 🐛 Troubleshooting

### Build Fails with "Module not found"
**Solution**: Ensure pnpm workspace dependencies are installed:
```bash
pnpm install --frozen-lockfile
```

### Import errors for @vital/* packages
**Solution**: Verify symlinks exist:
```bash
ls -la apps/digital-health-startup/node_modules/@vital
```

### Vercel deployment timeout
**Solution**: Increase build timeout in `vercel.json`:
```json
{
  "builds": [
    {
      "src": "apps/digital-health-startup/package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 300
      }
    }
  ]
}
```

### Environment variables not working
**Solution**: Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access.

## 📊 Performance Optimization

### Recommended Settings

1. **Enable Turborepo Caching** (already configured)
2. **Edge Runtime** for API routes (optional)
3. **Image Optimization** via Next.js Image component
4. **Bundle Analyzer** to check bundle size:
   ```bash
   pnpm build:analyze
   ```

### Expected Metrics

- **Lighthouse Score**: 95+ (already achieved)
- **Build Time**: ~2-3 minutes
- **Bundle Size**: ~500KB (gzipped)
- **Time to Interactive**: <2s

## 🔐 Security Checklist

- [ ] RLS policies enabled on Supabase
- [ ] API keys in environment variables (not committed)
- [ ] CORS configured correctly
- [ ] Rate limiting implemented (via Upstash)
- [ ] Authentication middleware active
- [ ] HTTPS enforced
- [ ] Security headers configured

## 📈 Post-Deployment

### Monitoring

1. **Langfuse Dashboard**: https://cloud.langfuse.com
   - Monitor LLM usage
   - Track costs
   - View traces

2. **Vercel Analytics**: Built-in performance monitoring

3. **Supabase Logs**: Database query performance

### Next Steps

1. Fix remaining build errors
2. Deploy to production
3. Set up custom domain
4. Configure CDN
5. Enable monitoring alerts
6. Schedule backups
7. Plan for scaling

## 🔗 Important Links

- **GitHub Repo**: https://github.com/curatedhealth/vital-expert-platform
- **Branch**: `restructure/world-class-architecture`
- **Monorepo Docs**: [README.md](../README.md)
- **Package Docs**: [packages/*/README.md](../packages/)

## 🎯 MVP Success Criteria

- [ ] App deployed and accessible
- [ ] Users can register/login
- [ ] Users can chat with agents
- [ ] Ask Expert feature works
- [ ] Performance meets targets
- [ ] Monitoring active
- [ ] No critical errors

---

**Built with** ❤️ **by the VITAL Team**

Last Updated: 2025-10-25
