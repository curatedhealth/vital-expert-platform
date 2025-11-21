# 🔧 Vercel Build Errors - Fix Guide

## 📊 **Error Summary**

The build failed with **21 errors**. Here are the main categories:

### 1. **Missing Dependencies** ❌
- `autoprefixer` - Required for PostCSS
- `@sentry/nextjs` - Sentry SDK not installed in workspace

### 2. **Code Errors** ❌
- Syntax error in `knowledge-domains/page.tsx` (line 1228)
- Syntax error in `slider.tsx` (line 21)

### 3. **Import Errors** ❌
- `@/lib/db/supabase/server` - Wrong path (should be `@/lib/supabase/server`)
- Client components importing server-only modules

### 4. **Node.js Module Errors** ❌
- `ioredis`, `pinecone`, packages trying to use Node.js modules in browser
- Need to be marked as external or server-only

---

## 🚀 **Quick Fix (Recommended)**

The easiest solution is to **temporarily disable problematic pages** and deploy a working subset:

### Step 1: Cancel Current Deployment

In Vercel dashboard, cancel the current deployment.

### Step 2: Create `.vercelignore` File

Create this file to exclude problematic pages:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
```

Create `.vercelignore`:
```
# Temporarily exclude problematic pages
src/app/(app)/langgraph-studio/**
src/app/(app)/knowledge-domains/**
src/app/(app)/workflow-designer/**
src/components/langgraph-visualizer.tsx

# Exclude workflow API routes
src/app/api/workflows/**
src/app/api/executions/**
```

### Step 3: Fix Missing Dependencies

```bash
cd apps/digital-health-startup
pnpm add autoprefixer
```

### Step 4: Remove Sentry Temporarily

Since `@sentry/nextjs` isn't installed, comment out Sentry:

Rename files:
```bash
mv sentry.client.config.ts sentry.client.config.ts.disabled
mv sentry.server.config.ts sentry.server.config.ts.disabled
mv sentry.edge.config.ts sentry.edge.config.ts.disabled
mv instrumentation.ts instrumentation.ts.disabled
```

### Step 5: Commit & Push

```bash
git add .
git commit -m "Fix: Exclude problematic pages for initial deployment"
git push
```

### Step 6: Redeploy

Vercel will auto-deploy, or manually trigger in dashboard.

---

## 🛠️ **Complete Fix (For Later)**

Once you have a working deployment, fix the issues one by one:

### Fix 1: Install Missing Dependencies

```bash
cd apps/digital-health-startup

# Add missing dependencies
pnpm add autoprefixer @sentry/nextjs

# Add to package.json if needed
```

### Fix 2: Fix Syntax Errors

**File**: `src/app/(app)/knowledge-domains/page.tsx` (line 1228)
```tsx
// Current (WRONG):
{/* Keywords */}

// Fix:
{/* Keywords */}
{domain.keywords && domain.keywords.length > 0 && (
  // ... rest of code
)}
```

**File**: `src/components/ui/slider.tsx` (line 21)
```tsx
// Ensure the component is properly structured
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    // ... your code

    return (
      <div className={`relative flex w-full items-center ${className}`}>
        {/* ... */}
      </div>
    );
  }
);
```

### Fix 3: Fix Import Paths

**Files with wrong import**:
- `src/app/api/executions/[id]/stream/route.ts`
- `src/app/api/workflows/[id]/execute/route.ts`
- `src/app/api/workflows/[id]/route.ts`
- `src/app/api/workflows/route.ts`

Change:
```typescript
// WRONG:
import { createClient } from '@/lib/db/supabase/server';

// CORRECT:
import { createClient } from '@/lib/supabase/server';
```

### Fix 4: Mark Server-Only Imports

**File**: `src/lib/supabase/server.ts`

Add at top:
```typescript
import 'server-only';  // <-- Add this
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
```

### Fix 5: Configure Next.js for Node Modules

**File**: `next.config.js`

Add:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
  
  serverExternalPackages: [
    'ioredis',
    'better-sqlite3',
    '@pinecone-database/pinecone',
  ],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

---

## 📋 **Step-by-Step Deployment Plan**

### Phase 1: Get SOMETHING Deployed (Now)
1. ✅ Create `.vercelignore` to exclude broken pages
2. ✅ Add `autoprefixer`  
3. ✅ Disable Sentry temporarily
4. ✅ Deploy
5. ✅ Verify basic pages work

### Phase 2: Fix Core Issues (Next)
1. Install `@sentry/nextjs`
2. Re-enable Sentry
3. Fix syntax errors in 2 files
4. Fix import paths (4 files)
5. Deploy & test

### Phase 3: Fix Advanced Features (Later)
1. Configure `serverExternalPackages`
2. Add `server-only` imports
3. Fix Redis/Pinecone client-side imports
4. Re-enable excluded pages
5. Full deployment

---

## 🎯 **Immediate Action Items**

**Right now, do this:**

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"

# 1. Create .vercelignore
cat > .vercelignore << 'EOF'
src/app/(app)/langgraph-studio/**
src/app/(app)/knowledge-domains/**
src/app/(app)/workflow-designer/**
src/components/langgraph-visualizer.tsx
src/app/api/workflows/**
src/app/api/executions/**
EOF

# 2. Install autoprefixer
pnpm add autoprefixer

# 3. Disable Sentry
mv sentry.client.config.ts sentry.client.config.ts.disabled 2>/dev/null || true
mv sentry.server.config.ts sentry.server.config.ts.disabled 2>/dev/null || true
mv sentry.edge.config.ts sentry.edge.config.ts.disabled 2>/dev/null || true
mv instrumentation.ts instrumentation.ts.disabled 2>/dev/null || true

# 4. Commit and push
cd ../..
git add apps/digital-health-startup/.vercelignore
git add apps/digital-health-startup/package.json
git add apps/digital-health-startup/pnpm-lock.yaml
git add apps/digital-health-startup/*.disabled
git commit -m "fix: Exclude problematic pages and add autoprefixer"
git push
```

Then go to Vercel and click **"Redeploy"**.

---

## ✅ **Success Criteria**

After applying quick fix, you should have:
- ✅ Home page loads
- ✅ Login page works
- ✅ Ask Expert page works (if not using excluded features)
- ✅ Dashboard accessible
- ⏳ Some pages temporarily disabled

---

## 📞 **Next Steps**

Once you have a working deployment:
1. Test what works
2. We'll fix the excluded pages one by one
3. Re-enable Sentry
4. Full feature parity

**Do you want me to help you run these commands?** Or would you prefer to apply the quick fix manually?

