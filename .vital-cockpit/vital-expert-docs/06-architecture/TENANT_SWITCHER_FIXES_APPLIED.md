# Tenant Switcher Fixes Applied

## Date: 2025-11-18

## Problem
User `hicham.naim@curated.health` (super_admin on vital-system tenant) could not see the tenant switcher dropdown to select between the 3 MVP tenants.

## Root Causes Identified

### 1. Missing Organization Field in Auth Context
**File**: `/apps/vital-system/src/lib/auth/supabase-auth-context.tsx`

**Issue**: The `TenantProvider` depends on an `organization` field from `useAuth()`, but the auth context was not providing it.

**Fix Applied**:
- Added `Organization` interface with fields: id, name, slug, tenant_type, tenant_key, is_active
- Added `organization` state to `AuthProvider`
- Added organization fetching logic in `fetchUserProfileInBackground()` using two separate queries:
  1. Fetch `organization_id` from `users` table
  2. Fetch full organization details from `organizations` table
- Added organization to context value and default return

### 2. Missing RLS Policies for Multitenancy Tables
**Database**: Supabase PostgreSQL

**Issue**: The frontend uses user session (authenticated role), but multitenancy tables only had RLS policies for `service_role`. This caused "Cannot coerce the result to a single JSON object" errors when trying to read tenant configurations.

**Fix Applied**: Added 8 RLS policies via psql:

```sql
-- tenant_configurations
CREATE POLICY "Users can read their tenant configuration"
ON tenant_configurations FOR SELECT TO authenticated
USING (tenant_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Super admins can read all tenant configurations"
ON tenant_configurations FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  JOIN public.users u ON u.id = p.id
  JOIN public.organizations o ON o.id = u.organization_id
  WHERE p.id = auth.uid() AND p.role = 'super_admin' AND o.tenant_type = 'system'
));

-- organizations
CREATE POLICY "Users can read all organizations"
ON organizations FOR SELECT TO authenticated
USING (is_active = true);

-- feature_flags
CREATE POLICY "Users can read feature flags"
ON feature_flags FOR SELECT TO authenticated
USING (true);

-- tenant_feature_flags
CREATE POLICY "Users can read their tenant feature flags"
ON tenant_feature_flags FOR SELECT TO authenticated
USING (tenant_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- tenant_apps
CREATE POLICY "Users can read their tenant apps"
ON tenant_apps FOR SELECT TO authenticated
USING (tenant_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- tenant_agents
CREATE POLICY "Users can read their tenant agents"
ON tenant_agents FOR SELECT TO authenticated
USING (tenant_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));
```

### 3. React Hooks Violation
**File**: `/apps/vital-system/src/components/tenant-switcher.tsx:154`

**Issue**: The component had an early return (`if (!showSwitcher) return null;`) BEFORE calling all hooks (specifically before `useEffect`), violating the Rules of Hooks which states hooks must be called in the same order on every render.

**Fix Applied**: Moved the conditional return check to line 154, AFTER all hooks are called:

```typescript
// All hooks called first
const router = useRouter();
const { tenant, reload, configuration } = useTenant();
const showSwitcher = useShowTenantSwitcher();
const uiConfig = useTenantUI();
const [tenants, setTenants] = useState<TenantWithConfig[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const supabase = createClient();

useEffect(() => {
  // Load tenants logic
}, [isOpen, supabase]);

// Helper functions
const switchTenant = async (targetTenant: Organization) => { ... };
const getTenantInfo = (tenantType: string) => { ... };

// NOW check if we should show the switcher (AFTER all hooks)
if (!showSwitcher) {
  return null;
}

return (<DropdownMenu>...</DropdownMenu>);
```

## Enhanced Debug Logging Added

To help diagnose any remaining issues, enhanced debug logging was added to `supabase-auth-context.tsx`:

1. **Session Check Logging** (line 116-129):
   - Session existence
   - User ID and email
   - Session expiry timestamp and date
   - Expiration status
   - User metadata

2. **Profile Creation Logging** (line 214):
   - Logs when creating profile from session

3. **Organization Fetching Logging** (lines 279-315):
   - User organization_id lookup
   - Organization data fetch
   - Success/failure messages with details

## Status

### ✅ Completed
1. Auth context now provides `organization` field
2. All RLS policies added for multitenancy tables
3. React Hooks violation fixed in TenantSwitcher
4. Enhanced debug logging added

### 🔍 Next Steps for User
1. **Hard refresh browser** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Check browser console for new enhanced debug logs:
   - Look for "🔍 [Auth Debug] getInitialSession" with full session details
   - Look for "📝 [Auth Debug] Creating profile from session"
   - Look for "🏢 [Auth Debug] Fetching organization"
   - Look for "✅ [Auth Debug] Organization set"
3. The tenant switcher button should appear in the top navigation showing "VITAL Expert Platform"
4. Clicking it should show a dropdown with all 3 tenants with their logos

## Verification

To verify the fixes are working, check:
1. Browser console shows `hasUser: true` instead of `false`
2. Organization is loaded: "✅ [Auth Debug] Organization set: VITAL Expert Platform Type: system"
3. Tenant switcher button appears in MainNavbar
4. Dropdown shows all 3 tenants:
   - VITAL Expert Platform (system)
   - Digital Health (digital_health)
   - Pharmaceuticals (pharmaceuticals)

## Unrelated Issues Found (Not Fixed)

1. **Tools API**: `column tools.implementation_type does not exist` - This is a schema mismatch issue in the tools table, separate from multitenancy
2. **Chat Messages Table**: Missing `chat_messages` table (referenced as `chat_sessions` in hint) - Separate issue from tenant switcher

## Files Modified

1. `/apps/vital-system/src/lib/auth/supabase-auth-context.tsx`
   - Added Organization interface
   - Added organization state and fetching
   - Added enhanced debug logging

2. `/apps/vital-system/src/components/tenant-switcher.tsx`
   - Fixed React Hooks violation by moving early return after all hooks

3. Database (via psql)
   - Added 8 RLS policies for multitenancy tables

## Next.js Hot Reload

Next.js detected the auth context changes and performed full page reloads (Fast Refresh warnings in stderr). The changes are live on the dev server.
