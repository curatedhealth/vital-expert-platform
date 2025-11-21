# 🚀 Create New Vercel Project: vital.expert

## 📋 Project Setup Plan

### Current Structure
- **vital-marketing-site**: Marketing/landing page (keep as-is)
- **vital.expert**: New production app (to be created)

---

## 🎯 **Step-by-Step Setup**

### 1. Create New Vercel Project

#### Via Vercel Dashboard (Recommended)

**A. Navigate to Vercel**
```
https://vercel.com/new
```

**B. Import Git Repository**
1. Click **"Add New..."** → **"Project"**
2. Select your Git provider (GitHub/GitLab/Bitbucket)
3. Find repository: **VITAL path** (or your repo name)
4. Click **"Import"**

**C. Configure Project**
```
Project Name: vital-expert
Framework Preset: Next.js
Root Directory: apps/digital-health-startup
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

**D. Environment Variables**
Add these (copy from existing project):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://c116ec533535b9117345233aaa3814d5@o4510307099279360.ingest.de.sentry.io/4510307121102928

# Pinecone (if using)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=

# Redis (if using)
REDIS_URL=

# API URLs
NEXT_PUBLIC_API_URL=https://vital-ai-engine.railway.app
```

**E. Deploy Settings**
```
Production Branch: main
Preview Branches: All other branches
Domain: vital-expert.vercel.app (auto-assigned)
```

**F. Click "Deploy"**
Wait 2-3 minutes for first deployment.

---

### 2. Configure Custom Domain (Optional)

Once deployed, add custom domain:

**A. In Vercel Dashboard**
1. Go to project: **vital.expert**
2. Click **"Settings"** → **"Domains"**
3. Add domain: **vital.expert** (or your domain)

**B. Update DNS Records**
Add these records to your DNS provider:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**C. Wait for SSL**
Vercel automatically provisions SSL certificate (5-10 minutes).

---

### 3. Update Marketing Site

Keep the marketing site separate:

**Project**: `vital-marketing-site`  
**Domain**: Your marketing domain  
**Branch**: Could be a separate branch or same repo, different root directory

---

## 📁 **Monorepo Configuration**

Your workspace structure:
```
VITAL path/
├── apps/
│   ├── digital-health-startup/   ← Production app (vital.expert)
│   └── marketing/                ← Marketing site (optional)
├── packages/
├── services/
│   └── ai-engine/                ← Backend (Railway)
└── ...
```

### Create Separate Vercel Projects:

**Project 1: vital.expert**
```yaml
name: vital-expert
rootDirectory: apps/digital-health-startup
branch: main
domain: vital.expert
```

**Project 2: vital-marketing-site** (existing)
```yaml
name: vital-marketing-site
rootDirectory: apps/marketing (or root)
branch: main
domain: your-marketing-domain.com
```

---

## 🔧 **CLI Method (Alternative)**

If you prefer command line:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# Login to Vercel
vercel login

# Create new project
vercel --prod

# Follow prompts:
# - Setup and deploy: Y
# - Which scope: Your account
# - Link to existing project: N
# - Project name: vital-expert
# - Directory: ./
# - Override settings: N

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SENTRY_DSN
# ... (add all required env vars)

# Deploy
vercel --prod
```

---

## ✅ **Verification Checklist**

After deployment:

### Functional Tests
- [ ] App loads without errors
- [ ] Authentication works
- [ ] Ask Expert feature works
- [ ] Dashboard navigation works
- [ ] API calls succeed

### Sentry Tests
- [ ] Frontend errors tracked
- [ ] Error appears in Sentry dashboard
- [ ] Stack traces are readable
- [ ] Performance monitoring works

### Domain Tests
- [ ] HTTPS works (green padlock)
- [ ] www redirects to root (if configured)
- [ ] SSL certificate valid
- [ ] Fast page loads (< 3 seconds)

---

## 🎯 **Deployment Strategy**

### Development Flow
```
1. Develop locally
   ↓
2. Commit to feature branch
   ↓
3. Push → Vercel creates preview
   ↓
4. Test preview URL
   ↓
5. Merge to main
   ↓
6. Auto-deploy to production (vital.expert)
```

### Branch Strategy
```
main          → Production (vital.expert)
staging       → Staging environment
feature/*     → Preview deployments
```

---

## 📊 **Project Comparison**

| Feature | vital.expert | vital-marketing-site |
|---------|--------------|----------------------|
| **Purpose** | Production app | Marketing/Landing |
| **Root Directory** | apps/digital-health-startup | Root or apps/marketing |
| **Framework** | Next.js (App Router) | Next.js (Pages) |
| **Auth** | Yes (Supabase) | No |
| **Database** | Yes (Supabase) | No |
| **AI Features** | Yes | No |
| **Users** | Authenticated | Public |
| **Sentry** | Yes | Optional |

---

## 🚀 **Next Steps**

### Immediate (5 minutes)
1. Go to https://vercel.com/new
2. Import your repository
3. Configure as "vital-expert"
4. Set root directory: `apps/digital-health-startup`
5. Add environment variables
6. Click "Deploy"

### After First Deploy (10 minutes)
1. Test the deployment URL
2. Verify all features work
3. Test Sentry error tracking
4. Add custom domain (optional)

### Configure Marketing Site (15 minutes)
1. Update existing `vital-marketing-site` project
2. Change root directory if needed
3. Keep it focused on marketing content

---

## 💡 **Benefits of This Approach**

✅ **Separation of Concerns**: App vs. marketing  
✅ **Independent Deployments**: Deploy each separately  
✅ **Different Branches**: Can use different strategies  
✅ **Clearer Analytics**: Separate traffic/metrics  
✅ **Better Performance**: Optimized for each purpose  
✅ **Easier Rollbacks**: Independent versioning  

---

## 📞 **Support Resources**

### Vercel Documentation
- New Project: https://vercel.com/docs/concepts/projects/overview
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Custom Domains: https://vercel.com/docs/concepts/projects/custom-domains
- Monorepo: https://vercel.com/docs/concepts/monorepos

### Current Setup
- Backend: https://vital-ai-engine.railway.app (Railway)
- Frontend: https://vital-expert.vercel.app (to be created)
- Marketing: Your existing site

---

## ✅ **Ready to Create?**

**Option A: Via Dashboard (Easiest)**
1. Open: https://vercel.com/new
2. Follow the configuration above
3. Deploy!

**Option B: Via CLI**
```bash
cd apps/digital-health-startup
vercel --prod
```

**Option C: I can guide you step-by-step**
Tell me when you're at each step and I'll help!

---

**Status**: 🟢 **Ready to create new project**  
**Time Required**: 5-10 minutes  
**Risk**: Low (marketing site unaffected)  

Let me know when you want to proceed! 🚀

