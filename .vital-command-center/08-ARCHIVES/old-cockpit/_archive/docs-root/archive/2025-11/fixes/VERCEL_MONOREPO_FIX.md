# Vercel Monorepo Configuration Fix

## Problem
Vercel is failing to build because:
1. The project uses a **pnpm workspace** monorepo
2. Vercel was configured to use `npm` instead of `pnpm`
3. Workspace dependencies (`@vital/sdk`, `@vital/ui`, `@vital/utils`) can't be resolved with npm

## Solution

### Step 1: Update Vercel Project Settings (In Dashboard)

Go to: https://vercel.com/crossroads-catalysts-projects/vital-marketing/settings

#### General Settings:

**Root Directory:**
```
. (leave empty - deploy from project root)
```

**Framework Preset:**
```
Next.js
```

**Build Command:** (Override - Important!)
```
cd apps/digital-health-startup && pnpm run build
```

**Output Directory:**
```
apps/digital-health-startup/.next
```

**Install Command:** (Override - Critical!)
```
pnpm install
```

**Development Command:**
```
cd apps/digital-health-startup && pnpm run dev
```

**Node.js Version:**
```
22.x
```

#### Click "Save" after each change

---

### Step 2: Redeploy

After updating settings:

1. Go to **Deployments** tab
2. Click on the most recent deployment
3. Click **"Redeploy"** button
4. Or push a new commit to trigger deployment

---

### Step 3: Monitor Build

Watch the build logs for:
- ✅ "Running pnpm install"
- ✅ Workspace dependencies resolved
- ✅ Build succeeds

Expected output:
```
Running "pnpm install"
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 2.1s

Running "cd apps/digital-health-startup && pnpm run build"
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Alternative: Deploy from Root with pnpm

If the above doesn't work, try this configuration:

**Root Directory:**
```
(empty - root of monorepo)
```

**Install Command:**
```
pnpm install
```

**Build Command:**
```
pnpm --filter @vital/digital-health-startup run build
```

**Output Directory:**
```
apps/digital-health-startup/.next
```

---

## Files Already Updated

✅ `apps/digital-health-startup/vercel.json` - Created with pnpm commands
✅ `apps/digital-health-startup/.npmrc` - Added `legacy-peer-deps=true`
✅ `apps/digital-health-startup/package.json` - Fixed dotenv version

All changes committed and pushed to GitHub.

---

## Quick Test Locally

To verify it works locally:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Install with pnpm
pnpm install

# Build the app
cd apps/digital-health-startup
pnpm run build

# Should succeed
```

---

## Next Steps After Build Succeeds

1. **Add Custom Domain:**
   - Go to Settings → Domains
   - Add: `vital.expert`
   - Add: `www.vital.expert`

2. **Configure DNS:**
   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```

3. **Verify Deployment:**
   ```bash
   curl https://vital-marketing-[random-id].vercel.app
   ```

---

## Troubleshooting

### Still Getting npm errors?

**Check that Install Command is set to:** `pnpm install`

You can verify in Settings → General → Build & Development Settings

### Build succeeds but shows "workspace" errors?

Make sure **Root Directory** is set to empty (.) not `apps/digital-health-startup`

### pnpm not found?

Vercel should auto-detect pnpm from `pnpm-lock.yaml`. If not, add this to environment variables:
```
ENABLE_EXPERIMENTAL_COREPACK=1
```

---

**Status:** Configuration files ready, dashboard settings need manual update
**Next:** Update Vercel Dashboard settings and redeploy
