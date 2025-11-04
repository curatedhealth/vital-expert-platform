# Migration 3 - RLS Policies for Tenant Isolation

## ✅ Status: READY TO EXECUTE

Migration 3 is ready to run! This migration adds the Row-Level Security (RLS) policies that enforce tenant isolation at the database level.

---

## 🎯 What Migration 3 Does

### 1. Creates Tenant Context Functions

**Purpose:** Allow setting and getting the current tenant from the session

```sql
set_tenant_context(tenant_id)      -- Set current tenant
get_current_tenant_id()            -- Get current tenant from session
```

### 2. Creates Resource Access Validation

```sql
can_access_resource(...)           -- Check if tenant can access a resource
```

**Logic:**
- ✅ Own resources: Always accessible
- ✅ Global shared: Accessible to all tenants
- ✅ Selective shared: Only if tenant in `shared_with` array
- ❌ Private: Only owner tenant

### 3. Adds RLS Policies to Agents Table

**4 Policies Created:**

| Policy | Operation | Purpose |
|--------|-----------|---------|
| `agents_select_with_sharing` | SELECT | Read agents based on tenant + sharing |
| `agents_insert_own_tenant` | INSERT | Create agents for own tenant only |
| `agents_update_own_tenant` | UPDATE | Update own tenant's agents only |
| `agents_delete_own_tenant` | DELETE | Delete own tenant's agents only |

### 4. Creates Materialized View for Performance

```sql
mv_platform_shared_resources
```

**Purpose:** Pre-computed view of all globally shared resources for fast queries

### 5. Adds Audit Logging

Tracks when resources are shared/unshared

---

## 🚀 How to Execute

### File to Use:
**`database/sql/migrations/2025/20251026000003_update_rls_policies.sql`**

### Steps:

1. **Open the file** in your editor
2. **Copy entire contents** (550+ lines)
3. **Go to**: [Supabase SQL Editor](https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql)
4. **Paste and click RUN**

### Expected Output:

```
✅ Migration 20251026000003 completed successfully
   Created functions: set_tenant_context, get_current_tenant_id, can_access_resource
   Created RLS policies: 4 policies on agents table
   Created materialized view: mv_platform_shared_resources
   Next step: Run 20251026000004_seed_mvp_tenants.sql
```

---

## 📋 RLS Policy Details

### Policy 1: SELECT (Read Access)

```sql
-- Users can see agents if:
-- 1. Agent belongs to their tenant, OR
-- 2. Agent is globally shared (platform agents), OR
-- 3. Agent is selectively shared with their tenant, OR
-- 4. User is platform admin
```

**Result:** Each tenant sees:
- Their own agents
- All 254 platform agents (globally shared)
- Any agents specifically shared with them

### Policy 2: INSERT (Create)

```sql
-- Users can only create agents for their own tenant
```

**Result:** New agents automatically belong to creator's tenant

### Policy 3: UPDATE (Modify)

```sql
-- Users can only update agents owned by their tenant
```

**Result:** Can't modify platform agents or other tenant's agents

### Policy 4: DELETE (Remove)

```sql
-- Users can only delete agents owned by their tenant
```

**Result:** Platform agents are protected from deletion

---

## 🔒 Security Features

### Database-Level Enforcement

✅ **Not application-level** - Can't be bypassed by app code
✅ **PostgreSQL enforced** - Built into database engine
✅ **Session-based** - Uses `app.tenant_id` session variable
✅ **Automatic** - No manual filtering needed in queries

### Tenant Isolation

```sql
-- Before RLS (no isolation):
SELECT * FROM agents;  -- Returns ALL 254 agents for everyone

-- After RLS (isolated):
-- Tenant A sees: 254 platform agents + their custom agents
-- Tenant B sees: 254 platform agents + their custom agents
-- Platform sees: ALL agents (admin bypass)
```

### Platform Admin Bypass

Platform admins can see/manage ALL resources across ALL tenants for management purposes.

---

## ⚠️ Important Notes

### This Migration is Safe

- ✅ Doesn't modify existing data
- ✅ Only adds policies and functions
- ✅ All 254 agents remain unchanged
- ✅ Can be rolled back if needed

### What Happens to Existing Queries

**Before Migration 3:**
```sql
SELECT * FROM agents;  -- Returns all agents
```

**After Migration 3:**
```sql
-- Same query, but RLS filters automatically!
SELECT * FROM agents;  -- Returns only accessible agents
```

**No application code changes needed!**

---

## 🔍 Testing After Migration

### Test 1: Verify RLS is Enabled

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'agents';
```

**Expected:** `rowsecurity = true`

### Test 2: Check Policies Created

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'agents'
ORDER BY policyname;
```

**Expected:** 4 rows (SELECT, INSERT, UPDATE, DELETE policies)

### Test 3: Verify Functions Exist

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('set_tenant_context', 'get_current_tenant_id', 'can_access_resource')
ORDER BY routine_name;
```

**Expected:** 3 rows

---

## 📊 Progress After Migration 3

- ✅ **Migration 1** - Tenants infrastructure ✓
- ✅ **Migration 2** - Tenant columns added ✓
- ✅ **Migration 3** - RLS policies enforced ✓ (in progress)
- ⏳ **Migration 4** - Seed tenants, assign 254 agents

**One more migration to go!**

---

## 🎯 What Changes

### Before Migration 3:
```sql
-- Agents table has tenant columns but no enforcement
SELECT * FROM agents WHERE tenant_id = 'XXX';  -- Manual filtering
```

### After Migration 3:
```sql
-- RLS automatically filters by tenant context
-- Just set tenant once:
SELECT set_tenant_context('TENANT_ID');

-- Then all queries are automatically filtered:
SELECT * FROM agents;  -- Only sees accessible agents!
```

---

## 🚀 Ready to Execute!

**File:** `database/sql/migrations/2025/20251026000003_update_rls_policies.sql`

**Action:** Copy entire file → Paste into Supabase SQL Editor → RUN

**Time:** ~2-3 minutes

**Risk:** Low (only adds policies, doesn't modify data)

---

**This is the security layer that makes multi-tenant work! 🔒**
