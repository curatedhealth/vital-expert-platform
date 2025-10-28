# Vercel Correct Settings - Copy These EXACTLY

## Problem
The install command and build command got swapped in Vercel dashboard.

## Solution - Update These Settings

Go to: https://vercel.com/crossroads-catalysts-projects/vital-marketing/settings/general

---

## Build & Development Settings

### Framework Preset
```
Next.js
```

### Root Directory
```
(leave EMPTY - no value)
```

### Build Command
**Click "OVERRIDE"** and enter:
```
cd apps/digital-health-startup && pnpm build
```

### Output Directory
**Click "OVERRIDE"** and enter:
```
apps/digital-health-startup/.next
```

### Install Command
**Click "OVERRIDE"** and enter:
```
pnpm install
```

### Development Command
```
cd apps/digital-health-startup && pnpm dev
```

### Node.js Version
```
22.x
```

---

## Important Notes

1. **Install Command** should be just `pnpm install` (NOT the cd command)
2. **Build Command** should have the `cd apps/digital-health-startup && pnpm build`
3. **Root Directory** should be EMPTY (Vercel will install from monorepo root)

---

## After Updating Settings

1. Click **"Save"** on each field
2. Go to **Deployments** tab
3. Click **"Redeploy"** (and select "Use existing Build Cache" = NO)
4. Watch build logs

---

## Expected Success Output

```
Running "install" command: `pnpm install`
Lockfile is up to date, resolution step is skipped
Packages: +2000
Done in 15s

Running "build" command: `cd apps/digital-health-startup && pnpm build`
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          120 kB
```

---

## Visual Guide

```
┌─────────────────────────────────────────────────┐
│ Framework Preset:     Next.js                   │
│ Root Directory:       [EMPTY]                   │
│ Build Command:        cd apps/digital-health... │ ← OVERRIDE
│ Output Directory:     apps/digital-health...    │ ← OVERRIDE
│ Install Command:      pnpm install              │ ← OVERRIDE
│ Development Command:  cd apps/digital-health... │
│ Node.js Version:      22.x                      │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Still getting "No such file or directory"?

Make sure:
- Root Directory is EMPTY (not set to `apps/digital-health-startup`)
- Install Command is `pnpm install` (no cd command)
- Build Command has the `cd apps/digital-health-startup` part

### Build command not saving?

Try:
1. Clear the field completely
2. Click "Override"
3. Paste the command
4. Click "Save"
5. Refresh the page to verify it saved

---

**Copy these exact values into Vercel Dashboard!**
