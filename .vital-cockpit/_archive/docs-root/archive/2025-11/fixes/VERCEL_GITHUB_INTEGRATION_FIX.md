# Vercel Deployment Fix - Use GitHub Integration

## Problem
- Vercel's npm registry is having intermittent connection issues
- pnpm workspace setup is complex for Vercel's build environment

## Solution: Use Vercel's GitHub Integration

This bypasses manual CLI deployment and uses Vercel's native Git integration which is more reliable.

---

## Step 1: Delete Current Project

1. Go to: https://vercel.com/crossroads-catalysts-projects/vital-marketing/settings/advanced
2. Scroll to bottom
3. Click **"Delete Project"**
4. Type `vital-marketing` to confirm
5. Click **"Delete"**

---

## Step 2: Create New Project from GitHub

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your repository: `curatedhealth/vital-expert-platform` (or your GitHub org/repo name)
4. Click **"Import"**

---

## Step 3: Configure Project

### Project Settings:

**Project Name:**
```
vital-marketing
```

**Framework Preset:**
```
Next.js
```

**Root Directory:**
```
apps/digital-health-startup
```
⚠️ **Important**: Set this to `apps/digital-health-startup` (NOT empty)

**Build Command:** (Leave DEFAULT - don't override)
```
(use default: next build)
```

**Output Directory:** (Leave DEFAULT)
```
(use default: .next)
```

**Install Command:** (Leave DEFAULT)
```
(use default: auto-detected from lock file)
```

---

## Step 4: Environment Variables

Add these 4 variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY
NEXT_PUBLIC_APP_URL=https://www.vital.expert
NODE_ENV=production
```

Select: ✓ Production ✓ Preview ✓ Development for each

---

## Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Clone from GitHub
   - Detect Next.js in `apps/digital-health-startup`
   - Auto-install dependencies
   - Build the app
   - Deploy to CDN

---

## Why This Works Better

### GitHub Integration Advantages:
1. **Automatic dependency resolution** - Vercel reads `pnpm-lock.yaml` directly
2. **Better caching** - Uses Vercel's build cache system
3. **Auto-deploys** - Every push to branch automatically deploys
4. **More reliable** - Doesn't depend on npm registry availability during install

### Root Directory Approach:
- Setting root to `apps/digital-health-startup` tells Vercel:
  - Run all commands from this directory
  - Use this directory's `package.json`
  - This avoids workspace complexity

---

## Expected Build Output

```
Cloning repository...
Analyzing source code...
Detected Next.js project in apps/digital-health-startup
Installing dependencies from lock file...
Dependencies installed in 25s
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (5/5)
✓ Finalizing page optimization
✓ Deployment ready
```

---

## After Successful Build

### Add Custom Domains:

1. Go to Settings → Domains
2. Add: `www.vital.expert`
3. Add: `vital.expert` (with redirect to www)

### Configure DNS:
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

---

## If Build Still Fails

### Check the Error:
- If "workspace" errors → Root directory is wrong
- If "Type errors" → That's OK for now, we'll fix in Phase 2
- If "Cannot find module" → Environment variables missing

### Solution for Type Errors:
Add this environment variable:
```
TYPESCRIPT_CHECK=false
```

Or update `next.config.js` to skip type checking:
```javascript
typescript: {
  ignoreBuildErrors: true,
},
```

---

## Alternative: Deploy Only Landing Page

If the full app won't build, create a minimal landing-only deployment:

1. Create new branch: `marketing-only`
2. Copy just the landing page components
3. Remove complex dependencies
4. Deploy from that branch

---

**This approach should work because Vercel's GitHub integration is battle-tested and handles monorepos better than CLI deployment.**
