# Manual Migration Execution Guide for Remote Supabase

## ⚠️ IMPORTANT: Read This First

We have **successfully restored 254 agents** to remote Supabase! 🎉

Now we need to run 4 SQL migrations to add multi-tenant architecture. Due to connection restrictions, these migrations need to be executed manually through the Supabase Dashboard.

---

## Current Status

✅ **Completed:**
- Backup of current remote database (3 agents → saved)
- Restoration of 254 agents from local backup
- Verification: All 254 agents now in remote Supabase

⏳ **Pending:**
- Migration 1: Create tenants table and helper functions
- Migration 2: Add tenant columns to agents table
- Migration 3: Update RLS policies for tenant isolation
- Migration 4: Seed MVP tenants and assign all 254 agents

---

## Migration Execution Steps

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `xazinxsiglqokwfmogyk`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New query**

---

### Step 2: Execute Migration 1 - Create Tenants Table

**File:** `database/sql/migrations/2025/20251026000001_create_tenants_table.sql`

**What it does:**
- Creates `tenants` table (4 types: client, solution, industry, platform)
- Creates `user_tenants` junction table for user-tenant relationships
- Creates `user_roles` table for role management
- Adds helper functions: `get_super_admin_tenant_id()`, `is_platform_admin()`, etc.

**Instructions:**
1. Open the migration file in your editor
2. Copy the **entire contents** (300+ lines)
3. Paste into Supabase SQL Editor
4. Click **RUN** button
5. ✅ Verify: Should see "Success. No rows returned"

**Verification Query:**
```sql
-- Run this after migration to verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tenants', 'user_tenants', 'user_roles')
ORDER BY table_name;

-- Should return 3 rows
```

---

### Step 3: Execute Migration 2 - Add Tenant Columns

**File:** `database/sql/migrations/2025/20251026000002_add_tenant_columns_to_resources.sql`

**What it does:**
- Adds `tenant_id`, `is_shared`, `sharing_mode`, `shared_with`, `resource_type` columns to `agents` table
- Creates `tools` table with multi-tenant support
- Creates `prompts` table with multi-tenant support
- Creates `workflows` table with multi-tenant support
- Adds foreign key constraints

**Instructions:**
1. Open the migration file
2. Copy **entire contents** (400+ lines)
3. Paste into Supabase SQL Editor
4. Click **RUN**
5. ✅ Verify: Should see "Success"

**Verification Query:**
```sql
-- Verify new columns were added to agents table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'agents'
  AND column_name IN ('tenant_id', 'is_shared', 'sharing_mode', 'shared_with', 'resource_type')
ORDER BY column_name;

-- Should return 5 rows
```

---

### Step 4: Execute Migration 3 - Update RLS Policies

**File:** `database/sql/migrations/2025/20251026000003_update_rls_policies.sql`

**What it does:**
- Creates tenant context functions: `set_tenant_context()`, `get_current_tenant_id()`
- Creates resource access validation function: `can_access_resource()`
- Adds RLS policies to `agents` table for SELECT, INSERT, UPDATE, DELETE
- Creates materialized view `mv_platform_shared_resources` for performance
- Adds RLS policies to `tools`, `prompts`, `workflows`

**Instructions:**
1. Open the migration file
2. Copy **entire contents** (500+ lines)
3. Paste into Supabase SQL Editor
4. Click **RUN**
5. ✅ Verify: Should see "Success"

**Verification Query:**
```sql
-- Verify RLS policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'agents'
ORDER BY policyname;

-- Should return multiple rows (SELECT, INSERT, UPDATE, DELETE policies)
```

---

### Step 5: Execute Migration 4 - Seed MVP Tenants

**File:** `database/sql/migrations/2025/20251026000004_seed_mvp_tenants.sql`

**What it does:**
- Creates **Platform Tenant** (owns all shared resources)
  - ID: `00000000-0000-0000-0000-000000000001`
  - Domain: `www.vital.expert`
  - Type: `platform`
- Creates **Digital Health Startup Tenant** (MVP tenant)
  - Domain: `digital-health-startup.vital.expert`
  - Type: `industry`
- **Assigns all 254 agents** to platform tenant as globally shared resources
- Creates helper function to assign users to Digital Health Startup tenant

**Instructions:**
1. Open the migration file
2. Copy **entire contents** (350+ lines)
3. Paste into Supabase SQL Editor
4. Click **RUN**
5. ✅ Verify: Should see "Success"

**Verification Query:**
```sql
-- Verify tenants were created
SELECT id, name, slug, domain, type, subscription_tier
FROM tenants
ORDER BY created_at;

-- Should return 2 rows (Platform + Digital Health Startup)

-- Verify all 254 agents assigned to platform tenant
SELECT
  COUNT(*) as total_agents,
  COUNT(CASE WHEN tenant_id = '00000000-0000-0000-0000-000000000001' THEN 1 END) as platform_agents,
  COUNT(CASE WHEN is_shared = true THEN 1 END) as shared_agents,
  COUNT(CASE WHEN sharing_mode = 'global' THEN 1 END) as globally_shared
FROM agents;

-- Should show: 254 total, 254 platform, 254 shared, 254 globally_shared
```

---

## Final Verification

After all 4 migrations complete, run this comprehensive verification:

```sql
-- 1. Check tenant setup
SELECT * FROM tenants ORDER BY created_at;

-- 2. Check agent assignment
SELECT
  tenant_id,
  is_shared,
  sharing_mode,
  resource_type,
  COUNT(*) as agent_count
FROM agents
GROUP BY tenant_id, is_shared, sharing_mode, resource_type;

-- 3. Test platform shared resources view
SELECT COUNT(*) FROM mv_platform_shared_resources WHERE resource_type = 'agent';

-- 4. List helper functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%tenant%'
ORDER BY routine_name;
```

**Expected Results:**
- 2 tenants (Platform + Digital Health Startup)
- 254 agents all assigned to platform tenant
- All agents marked as `is_shared = true`, `sharing_mode = 'global'`
- 254 agents in materialized view
- Multiple tenant helper functions created

---

## Troubleshooting

### Error: "relation already exists"
**Solution:** Table already created, skip to next migration

### Error: "column already exists"
**Solution:** Column already added, skip to next migration

### Error: "permission denied"
**Solution:** Ensure you're using Service Role key, not anon key

### Migrations fail midway
**Solution:**
1. Note which statement failed
2. Comment out completed statements
3. Re-run remaining statements
4. All migrations use `IF NOT EXISTS` so they're idempotent

---

## Post-Migration Tasks

After all migrations complete successfully:

1. ✅ Assign yourself as platform admin:
   ```sql
   -- Replace YOUR_USER_ID with your actual Supabase auth user ID
   INSERT INTO user_tenants (user_id, tenant_id, role)
   VALUES (
     'YOUR_USER_ID',
     '00000000-0000-0000-0000-000000000001',
     'admin'
   );
   ```

2. ✅ Test tenant isolation:
   ```sql
   -- Set tenant context to Digital Health Startup
   SELECT set_tenant_context('DIGITAL_HEALTH_STARTUP_TENANT_ID');

   -- Query agents (should see all 254 shared agents)
   SELECT COUNT(*) FROM agents;
   ```

3. ✅ Refresh materialized view periodically:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_shared_resources;
   ```

---

## Need Help?

If you encounter errors:
1. Take a screenshot of the error
2. Note which migration step failed
3. Check the Supabase logs (Dashboard → Logs)
4. Migrations are idempotent - safe to re-run

---

**Status:** Ready for manual execution
**Estimated Time:** 10-15 minutes total
**Prepared By:** Claude (Anthropic)
**Date:** October 26, 2025
