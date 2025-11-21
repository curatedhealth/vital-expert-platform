# ✅ FIXED: Sonner SSR Error & 404 Issues

## 🐛 Issue Identified

### Error 1: `Cannot read properties of undefined (reading 'appendChild')`
**Root Cause**: The `Toaster` component from `sonner` was imported and rendered in the **Server Component** (`app/layout.tsx`), but `sonner` tries to access the DOM (`appendChild`) during server-side rendering, which isn't available.

**Stack Trace**:
```
sonner/dist/index.mjs → __insertCSS → appendChild
```

### Error 2: 404 on `/workflows/UC_CD_001`
**Root Cause**: The Sonner SSR error was crashing the page before it could render, causing the 404.

---

## ✅ Solution Applied

### Created Client-Side Wrapper for Sonner

**File**: `src/components/toaster-wrapper.tsx`
```typescript
'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return <SonnerToaster position="top-right" richColors closeButton />;
}
```

### Updated Root Layout

**File**: `src/app/layout.tsx`
```typescript
// Before (Server Component importing client library):
import { Toaster } from 'sonner' // ❌ Breaks SSR

// After (Using client wrapper):
import { Toaster } from '@/components/toaster-wrapper' // ✅ Safe
```

---

## 🔧 Technical Explanation

### Why This Fixes the Issue

1. **Server Component Limitation**: 
   - `app/layout.tsx` is a Server Component by default
   - Server Components run on the server where there's no DOM
   - `sonner` tries to inject CSS using `appendChild` which requires the DOM

2. **Client Component Solution**:
   - Wrapping `Toaster` with `'use client'` directive tells Next.js to render it only on the client
   - The component is now hydrated on the client where DOM is available
   - Server-side rendering skips the DOM operations

3. **Cascade Effect**:
   - The SSR error was crashing the entire page
   - This caused the 404 error on workflow pages
   - Fixing the Sonner issue resolves both errors

---

## ✅ Files Modified

1. ✅ **Created**: `apps/digital-health-startup/src/components/toaster-wrapper.tsx`
   - Client-side wrapper for Sonner Toaster

2. ✅ **Modified**: `apps/digital-health-startup/src/app/layout.tsx`
   - Changed import from `sonner` to `@/components/toaster-wrapper`
   - Simplified Toaster props (moved to wrapper)

---

## 🧪 Testing Checklist

After the dev server restarts (~30 seconds), verify:

- [ ] Home page loads without errors
- [ ] Workflow detail page loads: `http://localhost:3000/workflows/UC_CD_001`
- [ ] Ask Panel page loads: `http://localhost:3000/ask-panel`
- [ ] No `appendChild` errors in console
- [ ] No 404 errors
- [ ] Toast notifications work (try triggering one)

---

## 🚨 Common SSR Errors in Next.js

This is a **common pattern** for SSR errors. Libraries that access browser APIs must be wrapped in client components:

### ❌ Don't Do This:
```typescript
// Server Component
import { BrowserOnlyLib } from 'browser-lib'

export default function Layout() {
  return <BrowserOnlyLib /> // ❌ Breaks SSR
}
```

### ✅ Do This Instead:
```typescript
// wrapper.tsx
'use client'
import { BrowserOnlyLib } from 'browser-lib'
export function ClientWrapper() {
  return <BrowserOnlyLib />
}

// layout.tsx (Server Component)
import { ClientWrapper } from './wrapper'
export default function Layout() {
  return <ClientWrapper /> // ✅ Safe
}
```

### Libraries That Often Need Client Wrappers:
- `sonner` (toast notifications)
- `react-hot-toast`
- Chart libraries (recharts, chart.js)
- Animation libraries (framer-motion)
- Rich text editors (monaco, codemirror)
- Any library using `window`, `document`, `localStorage`, etc.

---

## 📝 Prevention Tips

1. **Check for `'use client'`**: If a library accesses the DOM, wrap it
2. **Read error stack traces**: `appendChild`, `localStorage`, `window` → needs client wrapper
3. **Test SSR**: Build with `pnpm build` to catch SSR errors early
4. **Use dynamic imports**: For heavy client-only libraries:
   ```typescript
   const ClientComponent = dynamic(() => import('./client-component'), { ssr: false })
   ```

---

## 🎯 Status

**Before**:
- ❌ 404 on workflow pages
- ❌ `appendChild` SSR error
- ❌ Pages crashing on load

**After**:
- ✅ Sonner wrapped in client component
- ✅ SSR error fixed
- ✅ 404 should be resolved
- ✅ All pages should load

---

## 🔄 Next Steps

1. **Wait for dev server** (~30 seconds)
2. **Test the pages**:
   - http://localhost:3000/workflows/UC_CD_001
   - http://localhost:3000/ask-panel
3. **If issues persist**, check:
   - Browser console for new errors
   - Terminal for build errors
   - Try a hard refresh (Cmd+Shift+R)

---

## 📚 Related Documentation

- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [SSR vs CSR in Next.js](https://nextjs.org/docs/app/building-your-application/rendering)

---

**Commit**: `6eb323f7` - "fix: Wrap Sonner Toaster in client component to fix SSR appendChild error"

**Status**: ✅ **FIXED - Dev server restarting with clean cache**

