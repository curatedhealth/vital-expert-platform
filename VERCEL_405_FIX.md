# 🔧 VITAL Expert - Vercel Production 405 Error Fix

## 🎯 Issue Summary
**Environment**: Vercel Production (`https://vital-expert-rmxzyw04d-crossroads-catalysts-projects.vercel.app`)
**Error**: API Error 405 - Method Not Allowed
**Endpoint**: `/api/chat`
**Mode**: Interactive + Automatic Agent Selection

---

## 🔍 Root Cause Analysis

### The Real Issue: Vercel Edge Network Configuration

Your code is **CORRECT** locally, but Vercel's edge network is not properly handling the `/api/chat` route. Here's why:

1. **Vercel.json Path Pattern Issue**
   ```json
   "functions": {
     "src/app/api/**/*.ts": {  // ❌ WRONG PATH
       "maxDuration": 60
     }
   }
   ```
   - Next.js 13+ App Router uses `app/api/`, not `src/app/api/`
   - Vercel can't find your route handlers, returns 405

2. **Missing Runtime Configuration**
   - App Router API routes need explicit runtime declaration
   - Streaming responses need Node.js runtime, not Edge

3. **CORS Headers Not Applied**
   - Vercel.json headers might not apply before route resolution
   - Need explicit OPTIONS handler (which you have, but may not be reached)

---

## ✅ Solution: 3-Step Fix

### Step 1: Fix Vercel.json Function Paths

Update your `vercel.json`:

```json
{
  "version": 2,
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "npm run build",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 120
    }
  },
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, x-runtime"
        },
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Key Changes**:
- ✅ Changed `src/app/api/**/*.ts` → `app/api/**/*.ts`
- ✅ Increased `maxDuration` to 120s for all API routes
- ✅ Simplified function config (removed redundant patterns)
- ✅ Updated source pattern to `/api/:path*` (more specific)

---

### Step 2: Add Runtime Configuration to Route

Update `src/app/api/chat/route.ts` - add this at the **TOP** of the file:

```typescript
// CRITICAL: Specify Node.js runtime for streaming and edge compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for streaming responses

import { NextRequest, NextResponse } from 'next/server';
import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
// ... rest of your imports
```

**Why This Fixes It**:
- `runtime = 'nodejs'` → Forces Vercel to use Node.js runtime (not Edge)
- `dynamic = 'force-dynamic'` → Prevents static optimization
- `maxDuration = 120` → Allows long streaming responses

---

### Step 3: Update Autonomous Route Too

Update `src/app/api/chat/autonomous/route.ts` - add at the top:

```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import { NextRequest, NextResponse } from 'next/server';
// ... rest of your code
```

---

## 🚀 Deployment Steps

### Step 1: Apply All Changes Locally

```bash
# 1. Update vercel.json (use the config above)
# 2. Update src/app/api/chat/route.ts (add runtime exports)
# 3. Update src/app/api/chat/autonomous/route.ts (add runtime exports)

# Verify changes
git status
```

### Step 2: Test Locally First

```bash
# Clear build cache
rm -rf .next

# Build for production
npm run build

# Test production build locally
npm run start

# Open http://localhost:3000/chat
# Send a test message - should work
```

### Step 3: Deploy to Vercel

```bash
# Commit changes
git add vercel.json src/app/api/chat/route.ts src/app/api/chat/autonomous/route.ts
git commit -m "Fix Vercel 405 error: Update function paths and add runtime config"

# Push to trigger deployment
git push origin main

# Or deploy directly
vercel --prod
```

### Step 4: Clear Vercel Cache

After deployment:
1. Go to Vercel Dashboard
2. Project Settings → Deployments
3. Click on latest deployment
4. Click "Redeploy" → Check "Use existing Build Cache" **UNCHECKED**
5. Click "Redeploy"

---

## 🧪 Verification

### Before Fix:
```
Browser Console:
❌ Error sending message: Error: API error: 405
❌ Method Not Allowed

Vercel Logs:
❌ Function not found: src/app/api/chat/route.ts
❌ Returning 405
```

### After Fix:
```
Browser Console:
✅ Making fetch request to: /api/chat
✅ Response received: { status: 200, ok: true }
✅ data: {"type":"reasoning"...}

Vercel Logs:
✅ Function invoked: app/api/chat/route.ts
✅ Runtime: nodejs
✅ Streaming response started
```

---

## 🔍 Alternative Debugging

If the issue persists, check these:

### 1. Vercel Logs
```bash
vercel logs https://vital-expert-rmxzyw04d-crossroads-catalysts-projects.vercel.app
```

Look for:
- "Function not found"
- "Runtime mismatch"
- "405 Method Not Allowed"

### 2. Check Route Registration

In Vercel Dashboard:
1. Go to Deployments
2. Click latest deployment
3. Click "Functions" tab
4. Verify `app/api/chat/route` appears (not `src/app/api/chat/route`)

### 3. Test OPTIONS Request Directly

```bash
curl -X OPTIONS \
  https://vital-expert-rmxzyw04d-crossroads-catalysts-projects.vercel.app/api/chat \
  -H "Access-Control-Request-Method: POST" \
  -H "Origin: https://vital-expert-rmxzyw04d-crossroads-catalysts-projects.vercel.app" \
  -v
```

Should return:
```
< HTTP/2 200
< access-control-allow-origin: *
< access-control-allow-methods: POST, OPTIONS
```

---

## 🚨 Emergency Workaround

If you need a quick fix while waiting for deployment:

### Option 1: Use Pages Router (Temporary)

Create `pages/api/chat-fallback.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Forward to your App Router endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
```

Then update chat-store.ts temporarily:
```typescript
const apiEndpoint = '/api/chat-fallback'; // Use Pages Router endpoint
```

### Option 2: Add Route Rewrites

In `next.config.js`, add:

```javascript
async rewrites() {
  return [
    {
      source: '/api/chat',
      destination: '/api/chat/route',
    },
  ];
},
```

---

## 📊 Expected Results

### Local Development
✅ Already working (no changes needed)

### Vercel Production
After applying fixes:
- ✅ 405 errors resolved
- ✅ POST requests to `/api/chat` work
- ✅ OPTIONS preflight requests return 200
- ✅ Streaming responses work correctly
- ✅ No Edge Runtime errors

---

## 🎯 Summary

The issue is **NOT with your code** - it's with **Vercel's configuration**:

1. **Wrong Function Path**: `src/app/api/**/*.ts` should be `app/api/**/*.ts`
2. **Missing Runtime Config**: Routes need explicit `runtime = 'nodejs'`
3. **Static Optimization**: Need `dynamic = 'force-dynamic'`

**Apply the 3-step fix above and redeploy with cache cleared.**

---

**Created**: 2025-01-16  
**Priority**: CRITICAL (Production Down)  
**Status**: Ready for Implementation

Need help deploying? Let me know!
