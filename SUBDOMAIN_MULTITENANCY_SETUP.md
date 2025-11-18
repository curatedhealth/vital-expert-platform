# Subdomain-based Multitenancy Setup

## Overview

The VITAL platform now uses **subdomain-based multitenancy** instead of in-app tenant switching. Each tenant is accessed via a unique subdomain:

- **vital-system.localhost:3000** → VITAL Expert Platform (system tenant)
- **digital-health.localhost:3000** → Digital Health tenant
- **pharma.localhost:3000** → Pharmaceuticals tenant

## Local Development Setup

### Step 1: Configure /etc/hosts

Add the following entries to your `/etc/hosts` file:

```bash
# VITAL Multitenancy Subdomains
127.0.0.1   vital-system.localhost
127.0.0.1   digital-health.localhost
127.0.0.1   pharma.localhost
```

#### How to Edit /etc/hosts (Mac/Linux)

1. Open Terminal
2. Run: `sudo nano /etc/hosts`
3. Enter your password
4. Add the three lines above
5. Press `Ctrl+X`, then `Y`, then `Enter` to save
6. Flush DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

#### How to Edit hosts file (Windows)

1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add the three lines above (use `127.0.0.1` instead of localhost)
4. Save and close

### Step 2: Start Development Server

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
pnpm --filter @vital/vital-system dev
```

The server will start on port 3000 and respond to all subdomains.

### Step 3: Access Different Tenants

Open your browser and navigate to:

1. **VITAL Expert Platform**: http://vital-system.localhost:3000
2. **Digital Health**: http://digital-health.localhost:3000
3. **Pharmaceuticals**: http://pharma.localhost:3000

Each subdomain will automatically load the correct tenant configuration, apps, and features.

---

## Architecture Changes

### Middleware Layer

**File**: `/apps/vital-system/src/middleware.ts`

- Detects tenant from subdomain
- Sets `x-tenant-key` header for server components
- Sets `vital-tenant-key` cookie for client components

### Database Function

**Function**: `get_tenant_context_by_key(p_tenant_key TEXT, p_user_id UUID)`

- Loads tenant data by `tenant_key` (e.g., 'vital-system', 'digital-health', 'pharma')
- Returns organization, config, apps, and features in single query
- Works for any authenticated user regardless of their organization assignment

### Tenant Context Provider

**File**: `/apps/vital-system/src/contexts/tenant-context-subdomain.tsx`

- Reads `vital-tenant-key` cookie set by middleware
- Calls `get_tenant_context_by_key` with tenant key from cookie
- Watches for cookie changes and reloads tenant data
- No longer depends on user's organization assignment

---

## User Experience Changes

### For Regular Users

- **Before**: Users could only access their assigned tenant, saw tenant switcher if on system tenant
- **After**: Users can access any tenant by navigating to the subdomain (authentication still required)

### For Super Admins

- **Before**: Could switch tenants using dropdown in navigation bar
- **After**: Open multiple browser tabs, each with a different subdomain to access different tenants simultaneously

Example workflow:
1. Tab 1: http://vital-system.localhost:3000 (System tenant management)
2. Tab 2: http://digital-health.localhost:3000 (Digital Health tenant)
3. Tab 3: http://pharma.localhost:3000 (Pharmaceuticals tenant)

---

## Authentication Considerations

### Session Sharing

By default, Supabase sessions work across subdomains on localhost. In production, you'll need to configure:

```typescript
// lib/supabase/client.ts
createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // For production with custom domain:
    // cookieOptions: {
    //   domain: '.yourdomain.com', // Share cookies across subdomains
    // }
  },
});
```

### Logout Behavior

When a user logs out, they are logged out across all subdomains because the session is shared.

---

## Tenant Switcher Changes

### Current Implementation

The tenant switcher component still exists but now:
- Opens new browser tabs instead of switching in-place
- Only visible to super_admins on system tenant
- Shows available tenants with their subdomain URLs

### Future Enhancement

Update `/apps/vital-system/src/components/tenant-switcher.tsx` to:

```typescript
const handleTenantSwitch = (tenantKey: string) => {
  // Instead of router.push, open in new tab
  const subdomainUrl = `http://${tenantKey}.localhost:3000${window.location.pathname}`;
  window.open(subdomainUrl, '_blank');
};
```

---

## Testing Checklist

### 1. Subdomain Resolution

- [ ] Navigate to http://vital-system.localhost:3000
- [ ] Navigate to http://digital-health.localhost:3000
- [ ] Navigate to http://pharma.localhost:3000
- [ ] All should load without DNS errors

### 2. Middleware Detection

Open browser DevTools Console on each subdomain:

- [ ] Should see: `[Middleware] Extracted subdomain: vital-system`
- [ ] Should see: `[Middleware] Resolved tenant_key: vital-system`
- [ ] Check Application > Cookies: `vital-tenant-key` should be set

### 3. Tenant Context Loading

Check browser console for:

```
[TenantContext] Tenant key from cookie: vital-system
[TenantContext] Loading subdomain-based context for tenant: vital-system
[TenantContext] Loaded in <X>ms (target: <500ms)
[TenantContext] Tenant: VITAL Expert Platform ( system )
[TenantContext] Config loaded: 7 fields
[TenantContext] Apps loaded: 12
[TenantContext] Features loaded: 35
```

### 4. Tenant Data Isolation

On **vital-system.localhost:3000**:
- [ ] Dashboard shows VITAL Expert Platform branding
- [ ] Navigation includes "Tools" app

On **digital-health.localhost:3000**:
- [ ] Dashboard shows Digital Health branding
- [ ] Navigation does NOT include "Tools" app

On **pharma.localhost:3000**:
- [ ] Dashboard shows Pharmaceuticals branding
- [ ] HIPAA compliance settings visible
- [ ] Specific pharma apps available

### 5. Authentication Across Subdomains

- [ ] Log in on vital-system.localhost:3000
- [ ] Navigate to digital-health.localhost:3000 (should remain authenticated)
- [ ] Navigate to pharma.localhost:3000 (should remain authenticated)
- [ ] Log out from any subdomain (should log out from all)

---

## Troubleshooting

### Issue: "vital-system.localhost" doesn't resolve

**Solution**: Check `/etc/hosts` entries and flush DNS cache:

```bash
cat /etc/hosts | grep localhost
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Issue: "Tenant context is empty"

**Solution**: Check database has correct tenant_key values:

```sql
SELECT id, name, tenant_key, tenant_type FROM organizations;
```

Expected results:
- tenant_key: `vital-system` (not "system")
- tenant_key: `digital-health` (not "digital_health")
- tenant_key: `pharma` (not "pharmaceuticals")

### Issue: Middleware not detecting subdomain

**Solution**: Check Next.js middleware configuration:

1. Verify `/apps/vital-system/src/middleware.ts` exists
2. Check `config.matcher` includes your routes
3. Restart dev server: `Ctrl+C` then `pnpm dev`

### Issue: Cookie not set

**Solution**: Check browser DevTools:

1. Application tab > Cookies
2. Look for `vital-tenant-key` cookie
3. If missing, check middleware logs in terminal
4. Ensure middleware is running (should see logs on each request)

---

## Production Deployment

### DNS Configuration

For production with custom domain (e.g., yourdomain.com):

1. Add DNS A/CNAME records for each subdomain:
   - vital-system.yourdomain.com → Your server IP
   - digital-health.yourdomain.com → Your server IP
   - pharma.yourdomain.com → Your server IP

2. Or use wildcard DNS:
   - *.yourdomain.com → Your server IP

### SSL Certificates

Use wildcard SSL certificate:
- `*.yourdomain.com` covers all subdomains

### Environment Variables

Update `.env.production`:

```bash
NEXT_PUBLIC_SITE_URL=https://vital-system.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Migration from In-App Switching

### Backward Compatibility

The old tenant switching logic is preserved in:
- `/apps/vital-system/src/contexts/tenant-context-optimized.tsx`

To revert to in-app switching, update `/apps/vital-system/src/contexts/tenant-context.tsx`:

```typescript
export {
  TenantProviderOptimized as TenantProvider,
  useTenant,
} from './tenant-context-optimized';
```

### User Communication

Inform users about the change:

1. **Email**: Explain new subdomain URLs
2. **Bookmark Update**: Share new subdomain URLs to bookmark
3. **Documentation**: Update help docs with subdomain information

---

## Performance Benefits

### Before (In-App Switching)
- 7 sequential queries on tenant switch
- 3-7 second load time when switching
- Complex state management

### After (Subdomain-Based)
- 1 optimized query on page load
- <500ms load time
- Simpler state management
- Better browser caching (each subdomain has separate cache)
- Better security isolation

---

## Future Enhancements

### Short URLs

Implement URL shortener for easier sharing:
- `vital.link/dh` → `digital-health.yourdomain.com`
- `vital.link/ph` → `pharma.yourdomain.com`

### Custom Domains for Tenants

Allow enterprise tenants to use custom domains:
- `health.clientcompany.com` → CNAME to your infrastructure
- Detect tenant from custom domain in middleware

### Tenant-Specific Theming

Each subdomain can have fully custom:
- Color schemes
- Logos
- Fonts
- Layouts

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review console logs in browser DevTools
3. Check terminal logs for middleware output
4. Verify database tenant_key values

---

**🎉 Subdomain-based Multitenancy is now active!**

Access your tenants:
- http://vital-system.localhost:3000
- http://digital-health.localhost:3000
- http://pharma.localhost:3000
