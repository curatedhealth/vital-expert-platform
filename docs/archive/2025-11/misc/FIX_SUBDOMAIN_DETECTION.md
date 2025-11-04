# Fix Subdomain Detection - RLS Policy Required

## Problem Identified

The middleware cannot query the tenants table because Row Level Security (RLS) blocks anonymous access.

**Error in logs:**
```
[Tenant Middleware] No tenant found for subdomain: digital-health-startups
[Tenant Middleware] No tenant found for subdomain: pharma
```

**Root Cause:**
- Middleware uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` to query tenants
- RLS policies block anonymous reads of tenants table
- Tenants exist in database but middleware can't see them

---

## Solution: Enable Public Read Access

You need to run a SQL query in Supabase to allow anonymous users to read active tenants.

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

Copy and paste this SQL into the editor and click "Run":

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable read access for active tenants" ON public.tenants;

-- Create policy to allow anonymous reads of active tenants
CREATE POLICY "Enable read access for active tenants"
ON public.tenants
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Ensure RLS is enabled
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
```

### Step 3: Verify the Policy

Run this query to confirm the policy was created:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'tenants';
```

You should see:
```
policyname: Enable read access for active tenants
roles: {anon, authenticated}
cmd: SELECT
```

---

## Security Notes

**Is this safe?**

Yes, this is a standard multi-tenant pattern because:

1. **Only active tenants** are exposed (status = 'active')
2. **Limited fields** - middleware only queries: id, name, slug, status
3. **Required for routing** - subdomain detection must happen before authentication
4. **No sensitive data** - these fields are needed to route to the correct tenant

**What is NOT exposed:**
- Inactive/suspended tenants
- Tenant metadata (subscriptions, settings, etc.)
- User data
- Agent data

---

## After Running the SQL

### Test with curl:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Test platform tenant
curl -s http://localhost:3000/ | grep -i "tenant"

# Test digital-health-startups tenant
curl -s http://digital-health-startups.localhost:3000/ | grep -i "tenant"

# Test pharma tenant
curl -s http://pharma.localhost:3000/ | grep -i "tenant"
```

### Check dev server logs:

You should see:
```
[Tenant Middleware] Detected tenant from subdomain: digital-health-startups → <tenant-id>
[Tenant Middleware] Detected tenant from subdomain: pharma → <tenant-id>
```

Instead of:
```
[Tenant Middleware] No tenant found for subdomain: digital-health-startups
```

---

## Test in Browser

Once the RLS policy is applied:

1. **http://localhost:3000/agents**
   - Should redirect to / (Platform Tenant - no agents access)

2. **http://digital-health-startups.localhost:3000/agents**
   - Should load agents page with 254 agents

3. **http://pharma.localhost:3000/agents**
   - Should load agents page with 254 agents

---

## Files Reference

SQL file created at:
```
database/sql/enable_tenant_public_read.sql
```

You can also run this file directly if you prefer.

---

## Alternative: Use Service Role Key (NOT Recommended)

If you can't run the SQL, you could modify the middleware to use the service role key, but this is less secure and not recommended for production:

```typescript
// In middleware/tenant-middleware.ts line 33:
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;  // Instead of ANON_KEY
```

❌ **Don't do this** - it exposes the service role key in middleware which runs on the edge.

✅ **Do the RLS policy instead** - it's the proper multi-tenant pattern.
