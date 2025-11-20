# Authentication Bypass - Testing Mode

**Date**: 2025-11-19  
**Status**: ⚠️ TEMPORARY - FOR TESTING ONLY

---

## ⚠️ IMPORTANT WARNING

**This bypass is for testing purposes only. DO NOT deploy to production with this enabled.**

---

## What Was Changed

### 1. `apps/vital-system/src/app/(app)/layout.tsx`

Added temporary bypass flag:

```typescript
// TEMPORARY: Bypass authentication for testing
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true' || true; // Set to false to re-enable auth

if (!BYPASS_AUTH) {
  // Normal auth check
  // ...
}

// Bypass mode: render without authentication
return <AppLayoutClient initialUser={null}>{children}</AppLayoutClient>;
```

### 2. `apps/vital-system/src/app/(app)/AppLayoutClient.tsx`

Updated to handle bypass mode:

```typescript
// TEMPORARY: Allow rendering without auth for testing
const isBypassMode = initialUser === null && !hasAuthContext;

if (!hasAuthContext && !hasInitialUser && !isBypassMode) {
  return null;
}
```

---

## How to Re-enable Authentication

### Option 1: Set Environment Variable

```bash
# In .env.local
BYPASS_AUTH=false
```

### Option 2: Change Code Directly

In `layout.tsx`, change:
```typescript
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true' || false; // Changed true to false
```

---

## Testing Checklist

With bypass enabled, you should be able to:

- [x] Access `/personas` without signing in
- [x] See the personas page render
- [x] See API calls (may fail due to auth, but page should render)
- [ ] Test personas components
- [ ] Verify filtering works
- [ ] Test different views (grid, list, departments)

---

## Known Limitations

1. **API Routes Still Require Auth**: The `/api/personas` endpoint still uses `withAgentAuth`, so API calls will fail with 403 errors. The page will render but show error messages.

2. **No User Context**: Some features that depend on user data may not work.

3. **Tenant Detection**: May still work via middleware, but user-specific tenant detection won't work.

---

## Reverting Changes

**Before deploying to production:**

1. Set `BYPASS_AUTH=false` or remove the bypass code
2. Restore original authentication check
3. Test authentication flow
4. Verify all protected routes require auth

---

**Last Updated**: 2025-11-19  
**Status**: ⚠️ TEMPORARY - REMOVE BEFORE PRODUCTION

