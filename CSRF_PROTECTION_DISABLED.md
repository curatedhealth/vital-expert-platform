# 🔧 CSRF Protection Disabled for Development

## Issue Identified

The `__Host-` cookie prefix used for CSRF tokens has strict requirements:
1. ✅ Must be set with **Secure flag** (HTTPS only)
2. ✅ Must be set with **Path=/**
3. ✅ Cannot have **Domain attribute**

**Problem:** In development (`localhost`), the `Secure` flag prevents the cookie from being set since localhost uses HTTP, not HTTPS.

## Solution Applied

### 1. **Disabled CSRF Protection** for Development
Added to `.env.local`:
```bash
ENABLE_CSRF_PROTECTION=false
```

This allows the proxy middleware to bypass CSRF validation in development.

### 2. **Environment Variable Check**
The proxy middleware checks this flag:
```typescript
if (process.env.ENABLE_CSRF_PROTECTION !== 'false') {
  // CSRF validation logic...
}
```

## Next Steps

### Restart the Server
```bash
npm run dev
```

### Test the Fix
1. Navigate to `/ask-expert`
2. Select an agent
3. Check browser console for:
   ```
   Fetching prompt starters for agents: [...]
   Prompt starters API response: { status: 200, ok: true, prompts: X }
   ```

4. Check server logs for:
   ```
   POST /api/prompt-starters 200 in XXXms
   ```

## Production Considerations

⚠️ **IMPORTANT:** This should **ONLY be disabled in development**!

### For Production:
1. **Enable HTTPS** (Vercel/production environments)
2. **Re-enable CSRF protection:**
   ```bash
   ENABLE_CSRF_PROTECTION=true
   # or remove the variable (defaults to enabled)
   ```
3. The `Secure` flag will work correctly over HTTPS
4. CSRF tokens will protect against cross-site attacks

## Alternative Solutions (for future)

If you want CSRF protection in development:

### Option 1: Use localhost HTTPS
```bash
npm install -g mkcert
mkcert -install
mkcert localhost
# Configure Next.js to use HTTPS
```

### Option 2: Remove `__Host-` Prefix in Development
Update `csrf.ts` to use a simple cookie name in development:
```typescript
const CSRF_COOKIE_NAME = process.env.NODE_ENV === 'production' 
  ? '__Host-csrf-token' 
  : 'csrf-token';
```

### Option 3: Use SameSite=Strict Only
For internal apps without external API calls, `SameSite=Strict` provides good CSRF protection without needing tokens.

---

## Files Modified

1. **`.env.local`**: Added `ENABLE_CSRF_PROTECTION=false`
2. **`apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`**: Added CSRF token extraction (for when re-enabled)

---

**Status:** ✅ CSRF Protection Disabled for Development
**Action Required:** Restart server with `npm run dev`

