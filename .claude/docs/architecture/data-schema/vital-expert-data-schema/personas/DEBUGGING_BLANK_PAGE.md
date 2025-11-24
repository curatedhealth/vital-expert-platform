# Debugging Blank Page Issue - Personas Page

**Date**: 2025-11-19  
**Issue**: Page not loading / blank page

---

## 🔍 Diagnostic Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for:
   - Red error messages
   - JavaScript errors
   - Network errors

**Common Errors:**
- `Cannot find module` → Import error
- `401 Unauthorized` → Authentication issue
- `403 Forbidden` → Permission issue
- `500 Internal Server Error` → Server error

### Step 2: Check Network Tab

1. Open **Network** tab in DevTools
2. Refresh the page
3. Look for:
   - `/api/personas` request
   - Status code (200, 401, 403, 500)
   - Response body

**Expected:**
- Status: `200 OK` (if authenticated)
- Status: `401/403` (if not authenticated) → Should redirect to `/login`

### Step 3: Check Terminal Logs

Look for middleware logs:
```
[Tenant Middleware] Request hostname: vital-system.localhost:3000
[Tenant Middleware] Detected tenant: ...
[Proxy] Redirecting to /login
```

### Step 4: Verify Authentication

**If you see a redirect to `/login`:**
1. Sign in first
2. Then navigate to `/personas`

**Check if you're authenticated:**
```javascript
// In browser console
document.cookie
// Look for supabase auth tokens
```

### Step 5: Test Simple Route

Try accessing the test page:
```
http://vital-system.localhost:3000/personas/test-page
```

If this works, the issue is with the main page component.

---

## 🐛 Common Issues & Fixes

### Issue 1: Authentication Redirect

**Symptom:** Page redirects to `/login` immediately

**Cause:** `layout.tsx` checks authentication server-side

**Fix:**
1. Sign in at `/login`
2. Then access `/personas`

**Verify:**
```typescript
// apps/vital-system/src/app/(app)/layout.tsx
// This redirects if not authenticated
if (error || !user) {
  redirect('/login');
}
```

### Issue 2: Middleware Blocking

**Symptom:** Request never reaches the page

**Check:**
1. Terminal logs for `[Proxy]` or `[Tenant Middleware]` messages
2. Network tab shows request was blocked

**Fix:**
- Check `/etc/hosts` is configured
- Use subdomain URL: `vital-system.localhost:3000`

### Issue 3: JavaScript Error

**Symptom:** Blank page, error in console

**Check:**
- Browser console for errors
- Component import errors
- Missing dependencies

**Fix:**
```bash
cd apps/vital-system
pnpm install
pnpm build
```

### Issue 4: Component Import Error

**Symptom:** `Cannot find module '@/components/personas'`

**Check:**
```bash
ls -la apps/vital-system/src/components/personas/
# Should show:
# - PersonaCard.tsx
# - PersonaListItem.tsx
# - PersonaStatsCards.tsx
# - PersonaFilters.tsx
# - types.ts
# - index.ts
```

**Fix:**
- Verify all files exist
- Check `index.ts` exports correctly

### Issue 5: API Route Error

**Symptom:** API returns error

**Check:**
```bash
curl -v http://vital-system.localhost:3000/api/personas
```

**Expected:**
- If authenticated: JSON response with personas
- If not authenticated: `401` or `403` error

---

## 🔧 Quick Fixes

### Fix 1: Restart Dev Server

```bash
# Kill existing server
lsof -ti:3000 | xargs kill -9

# Restart
cd apps/vital-system
pnpm dev
```

### Fix 2: Clear Browser Cache

1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Or clear cache in DevTools

### Fix 3: Check Middleware File

```bash
# Verify middleware.ts exists
ls -la apps/vital-system/src/middleware.ts

# Should exist and export proxy
```

### Fix 4: Verify Subdomain

**Must use:**
```
http://vital-system.localhost:3000/personas
```

**NOT:**
```
http://localhost:3000/personas  ❌
```

---

## 📊 Expected Behavior

### If Authenticated:
1. Page loads
2. Shows loading spinner
3. Fetches personas from API
4. Displays personas in grid/list

### If Not Authenticated:
1. Page redirects to `/login`
2. After login, redirects back to `/personas`

### If Error:
1. Shows error message
2. Shows "Retry" button
3. Logs error to console

---

## 🧪 Test Checklist

- [ ] Browser console shows no errors
- [ ] Network tab shows `/api/personas` request
- [ ] Terminal shows middleware logs
- [ ] `/etc/hosts` configured correctly
- [ ] Using subdomain URL
- [ ] Signed in (if required)
- [ ] Dev server running
- [ ] All component files exist

---

## 📝 Debugging Commands

```bash
# Check if server is running
lsof -ti:3000

# Check middleware file
cat apps/vital-system/src/middleware.ts

# Check hosts file
cat /etc/hosts | grep vital-system

# Test API directly
curl -v http://vital-system.localhost:3000/api/personas

# Check for build errors
cd apps/vital-system && pnpm build 2>&1 | grep -i error
```

---

## 🆘 Still Not Working?

1. **Check browser console** - Most errors show there
2. **Check terminal logs** - Look for middleware/API errors
3. **Try test page** - `/personas/test-page` to verify routing
4. **Check authentication** - Sign in first
5. **Verify subdomain** - Must use `vital-system.localhost:3000`

---

**Last Updated**: 2025-11-19

