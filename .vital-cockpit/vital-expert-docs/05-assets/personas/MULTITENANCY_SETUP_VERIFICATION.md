# Multi-Tenancy Setup Verification for Personas

**Date**: 2025-11-19  
**Status**: Setup Complete

---

## ✅ Multi-Tenancy Architecture

### Middleware Flow

```
Request → middleware.ts → proxy.ts → tenantMiddleware → API Route
```

1. **Root Middleware** (`src/middleware.ts`)
   - Entry point for Next.js middleware
   - Exports `proxy` function as default handler

2. **Proxy** (`src/proxy.ts`)
   - Handles authentication
   - Calls `tenantMiddleware` to detect tenant
   - Sets tenant headers and cookies

3. **Tenant Middleware** (`src/middleware/tenant-middleware.ts`)
   - Detects tenant from subdomain (highest priority)
   - Falls back to user profile, header, or cookie
   - Sets `x-tenant-id` header and `vital-tenant-key` cookie

4. **API Route** (`src/app/api/personas/route.ts`)
   - Uses `withAgentAuth` for authentication
   - Gets `tenant_id` from `profile.tenant_id` (from context)
   - Filters personas using `allowed_tenants` array

---

## 🔍 Tenant Detection Priority

1. **Subdomain** (highest priority)
   - `vital-system.localhost:3000` → `vital-system` tenant_key
   - `digital-health.localhost:3000` → `digital-health` tenant_key
   - `pharma.localhost:3000` → `pharma` tenant_key

2. **User Profile** (if authenticated)
   - Checks `profiles.tenant_id`

3. **Header** (`x-tenant-id`)
   - Allows client override

4. **Cookie** (`tenant_id`)
   - Persists across requests

5. **Fallback** → Platform Tenant (`00000000-0000-0000-0000-000000000001`)

---

## 🧪 Testing Multi-Tenancy

### Step 1: Configure /etc/hosts

```bash
sudo nano /etc/hosts
# Add:
127.0.0.1   vital-system.localhost
127.0.0.1   digital-health.localhost
127.0.0.1   pharma.localhost
```

### Step 2: Verify Middleware is Active

Check browser console or terminal logs for:
```
[Tenant Middleware] Request hostname: vital-system.localhost:3000
[Tenant Middleware] Extracted subdomain: vital-system
[Tenant Middleware] Detected tenant: VITAL Expert Platform (vital-system) → c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244
```

### Step 3: Check Headers

The middleware sets:
- `x-tenant-id`: Tenant UUID
- `x-tenant-key`: Tenant key (e.g., `vital-system`)
- `x-tenant-detection-method`: How tenant was detected
- `vital-tenant-key` cookie: For client-side access

### Step 4: Verify API Filtering

The `/api/personas` endpoint:
1. Gets `tenant_id` from authenticated user's profile
2. Filters personas: `query.contains('allowed_tenants', [tenant_id])`
3. Returns only personas accessible to that tenant

---

## 🔧 Troubleshooting

### Issue: Blank Page

**Possible Causes:**
1. Middleware not running (check `src/middleware.ts` exists)
2. Authentication failing (redirect to `/login`)
3. JavaScript error (check browser console)

**Check:**
```bash
# Verify middleware file exists
ls -la apps/vital-system/src/middleware.ts

# Check terminal logs for middleware output
# Look for "[Tenant Middleware]" logs
```

### Issue: Wrong Tenant Detected

**Check:**
1. `/etc/hosts` configuration
2. Browser URL (must use subdomain: `vital-system.localhost:3000`)
3. Terminal logs for tenant detection method

**Debug:**
```javascript
// In browser console
document.cookie // Check for vital-tenant-key cookie
```

### Issue: No Personas Showing

**Check:**
1. Database has personas with correct `allowed_tenants`:
   ```sql
   SELECT id, name, allowed_tenants 
   FROM personas 
   WHERE 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' = ANY(allowed_tenants)
   LIMIT 10;
   ```

2. User profile has correct `tenant_id`:
   ```sql
   SELECT id, email, tenant_id 
   FROM profiles 
   WHERE email = 'your-email@example.com';
   ```

3. API is receiving correct tenant_id (check network tab)

---

## 📊 Tenant Configuration Reference

### vital-system Tenant

| Property | Value |
|----------|-------|
| **Tenant Key** | `vital-system` |
| **Tenant ID** | `c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244` |
| **Subdomain** | `vital-system.localhost:3000` |
| **Type** | `system` |

### digital-health Tenant

| Property | Value |
|----------|-------|
| **Tenant Key** | `digital-health` |
| **Tenant ID** | `684f6c2c-b50d-4726-ad92-c76c3b785a89` |
| **Subdomain** | `digital-health.localhost:3000` |
| **Type** | `digital_health` |

### pharma Tenant

| Property | Value |
|----------|-------|
| **Tenant Key** | `pharma` |
| **Tenant ID** | `c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b` |
| **Subdomain** | `pharma.localhost:3000` |
| **Type** | `pharmaceuticals` |

---

## 🔗 Related Files

- **Root Middleware**: `apps/vital-system/src/middleware.ts` ⭐ NEW
- **Proxy Logic**: `apps/vital-system/src/proxy.ts`
- **Tenant Middleware**: `apps/vital-system/src/middleware/tenant-middleware.ts`
- **Personas API**: `apps/vital-system/src/app/api/personas/route.ts`
- **Agent Auth**: `apps/vital-system/src/middleware/agent-auth.ts`

---

## ✅ Verification Checklist

- [x] `middleware.ts` file created at root
- [x] Middleware exports proxy function
- [x] Tenant middleware detects subdomain
- [x] Tenant headers set correctly
- [x] API routes use tenant filtering
- [x] Authentication flow works
- [ ] `/etc/hosts` configured
- [ ] Test with subdomain URL
- [ ] Verify personas filtered by tenant

---

**Status**: ✅ Middleware Setup Complete  
**Last Updated**: 2025-11-19

