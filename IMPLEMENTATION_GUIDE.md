# Implementation Guide: User-Tenant Mapping for Agents

## Quick Answer to Your Questions

**Q: Is it fetching agents for tenant or for user?**
**A: Currently fetching agents with NO tenant filtering. The tenant_id column doesn't exist in the profiles table yet.**

**Q: Do we have mapping between user and tenant?**
**A: NO - the `profiles` table is missing the `tenant_id` column to establish this mapping.**

## Current Architecture

```
┌─────────────────────┐
│   agents            │
│   - id              │
│   - name            │
│   - tenant_id ✓    │
└─────────────────────┘
         ↑
         │ has tenant_id
         │
┌─────────────────────┐
│   profiles          │
│   - id              │
│   - email           │
│   - tenant_id ✗    │ ← MISSING!
└─────────────────────┘
```

## Implementation Steps

### Step 1: Run Database Migration

Go to Supabase SQL Editor and run:

```sql
-- Add tenant_id column to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- Set existing users to platform tenant by default
UPDATE profiles 
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.tenant_id IS 'Tenant/organization this user belongs to. Links to tenants table.';
```

### Step 2: Update Agent Fetching Logic

The file `src/app/api/agents-crud/route.ts` currently has tenant filtering **disabled** (lines 88-96).

**Current Code:**
```typescript
// TENANT FILTERING: Show tenant-specific agents + global shared agents
// For now, DISABLE tenant filtering to show all agents (superadmin view)
// TODO: Re-enable once tenant_id column is properly populated and user roles are implemented
console.log(`📊 [Agents CRUD] Showing all agents (tenant filtering disabled for superadmin)`);

// FUTURE: When tenant filtering is ready, uncomment this:
// if (tenantId && tenantId !== PLATFORM_TENANT_ID) {
//   query.or(`tenant_id.eq.${tenantId},tenant_id.eq.${PLATFORM_TENANT_ID}`);
// } else {
//   query.eq('tenant_id', PLATFORM_TENANT_ID);
// }
```

**After migration, update to:**

```typescript
export async function GET(request: Request) {
  try {
    // Get user from auth session
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get user's tenant from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user?.id)
      .single();

    const userTenantId = profile?.tenant_id || '00000000-0000-0000-0000-000000000001';
    
    console.log(`🔍 [Agents CRUD] Fetching agents for user tenant: ${userTenantId}`);

    const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

    // Query agents with tenant filtering
    const query = supabase
      .from('agents')
      .select(`
        id,
        name,
        description,
        system_prompt,
        capabilities,
        metadata,
        tenant_id,
        created_at,
        updated_at
      `);

    // TENANT FILTERING: Show tenant-specific agents + global shared agents
    if (userTenantId && userTenantId !== PLATFORM_TENANT_ID) {
      // User is on a specific tenant: show their agents + global agents
      query.or(`tenant_id.eq.${userTenantId},tenant_id.eq.${PLATFORM_TENANT_ID}`);
      console.log(`📊 [Agents CRUD] Showing tenant-specific + platform agents`);
    } else {
      // User is on Platform tenant: only show global/platform agents
      query.eq('tenant_id', PLATFORM_TENANT_ID);
      console.log(`📊 [Agents CRUD] Showing only platform agents`);
    }

    query.order('name', { ascending: true });

    const { data: agents, error } = await query;

    // ... rest of the code
  }
}
```

### Step 3: Test the Implementation

1. Run the migration in Supabase
2. Restart your dev server
3. Log in and check that agents are filtered by tenant
4. Verify that users only see agents from their tenant + platform agents

## Expected Behavior After Implementation

- **Platform Tenant Users**: See only platform/shared agents
- **Specific Tenant Users**: See their tenant's agents + platform agents
- **No Cross-Tenant Access**: Users cannot see other tenants' private agents

## Files Modified

- `database/migrations/007_add_tenant_to_profiles.sql` - New migration
- `src/app/api/agents-crud/route.ts` - Agent fetching logic (pending update)
- `AGENT_FETCHING_ANALYSIS.md` - Detailed analysis (already created)

## Next Steps

1. ✅ Migration file created
2. ⏳ Run migration in Supabase SQL Editor
3. ⏳ Update agent fetching logic
4. ⏳ Test the implementation

## Summary

- **Current State**: No user-tenant mapping exists
- **Problem**: Agents are shown without tenant filtering
- **Solution**: Add `tenant_id` column to profiles table
- **Impact**: Users will only see agents from their tenant + platform agents
