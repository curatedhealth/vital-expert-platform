# Migration 1 - FIXED VERSION

## ⚠️ IMPORTANT: Use the FIXED Version!

**Problem Found:** The original Migration 1 had a circular dependency where RLS policies referenced tables that didn't exist yet.

**Solution:** Created a FIXED version that creates tables first, then RLS policies.

---

## ✅ Use This File:

**File:** `database/sql/migrations/2025/20251026000001_create_tenants_table_FIXED.sql`

**Changes from original:**
1. ✅ Creates all 3 tables FIRST (tenants, user_tenants, user_roles)
2. ✅ Creates helper functions SECOND
3. ✅ Creates RLS policies LAST (after tables exist)

**Result:** No more `ERROR: relation "user_roles" does not exist`

---

## 🚀 How to Execute

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql

### Step 2: Copy the FIXED Migration

1. Open file: `database/sql/migrations/2025/20251026000001_create_tenants_table_FIXED.sql`
2. Copy **ALL contents** (entire file)
3. Paste into Supabase SQL Editor
4. Click **RUN**

### Step 3: Verify Success

You should see:
```
✅ Migration 20251026000001 (FIXED) completed successfully
   Created tables: tenants, user_tenants, user_roles
   Created functions: get_super_admin_tenant_id, is_platform_admin, has_tenant_access, get_tenant_by_domain, get_tenant_by_slug
   Created RLS policies for all tables
   Next step: Run 20251026000002_add_tenant_columns_to_resources.sql
```

### Step 4: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tenants', 'user_tenants', 'user_roles')
ORDER BY table_name;
```

**Expected Result:** 3 rows returned

---

## 📋 What This Migration Creates

### Tables (3)

1. **`tenants`** - Main tenant table
   - 39 columns including: id, name, slug, domain, type, subscription_tier, status
   - Supports 4 tenant types: client, solution, industry, platform
   - JSONB fields for flexible configuration

2. **`user_tenants`** - User-tenant relationships
   - Maps users to tenants with roles (owner, admin, member, guest)
   - Tracks invitation and join status

3. **`user_roles`** - Platform and tenant roles
   - Platform-wide roles: platform_admin, platform_support
   - Tenant-specific roles: tenant_admin, tenant_owner, user

### Functions (6)

| Function | Purpose |
|----------|---------|
| `get_super_admin_tenant_id()` | Returns platform tenant ID |
| `is_platform_admin(user_id)` | Check if user is platform admin |
| `get_user_tenant_ids(user_id)` | Get array of user's tenant IDs |
| `has_tenant_access(user_id, tenant_id)` | Check tenant access |
| `get_tenant_by_domain(domain)` | Lookup tenant by domain |
| `get_tenant_by_slug(slug)` | Lookup tenant by slug |

### RLS Policies (6)

- `tenants_platform_admin_all` - Platform admins see all tenants
- `tenants_admin_own_tenant` - Tenant admins see their tenant
- `tenants_public_info` - All users see active tenants
- `user_tenants_own_access` - Users see their tenant memberships
- `user_roles_own_access` - Users see their roles

### Indexes (12)

Performance indexes on:
- Tenant slug, domain, type, status
- Subscription status and tier
- User-tenant relationships
- User roles

---

## 🔍 Differences from Original

**Original (`20251026000001_create_tenants_table.sql`):**
```sql
-- 1. Create tenants table
-- 2. Create indexes
-- 3. Create triggers
-- 4. Create RLS policies ❌ (references tables that don't exist yet)
-- 5. Create supporting tables (user_tenants, user_roles)
-- 6. Create helper functions
```

**FIXED (`20251026000001_create_tenants_table_FIXED.sql`):**
```sql
-- 1. Create tenants table ✅
-- 2. Create supporting tables (user_tenants, user_roles) ✅
-- 3. Create indexes ✅
-- 4. Create triggers ✅
-- 5. Create helper functions ✅
-- 6. Create RLS policies ✅ (tables exist now!)
```

**Order matters!** RLS policies must be created AFTER the tables they reference.

---

## ✅ Next Steps

After this migration succeeds:

1. ✅ Proceed to Migration 2:
   - File: `20251026000002_add_tenant_columns_to_resources.sql`
   - Adds tenant columns to agents table

2. ✅ Then Migration 3:
   - File: `20251026000003_update_rls_policies.sql`
   - Adds RLS policies to agents table

3. ✅ Finally Migration 4:
   - File: `20251026000004_seed_mvp_tenants.sql`
   - Creates 2 tenants and assigns 254 agents

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Cause:** Migration was partially run before

**Solution:** The FIXED migration uses `DROP TABLE IF EXISTS` at the start, so just re-run it.

### Error: "permission denied"
**Cause:** Not using Service Role key

**Solution:** Ensure you're logged into Supabase Dashboard with admin access

### Error: "column does not exist"
**Cause:** Different error, not related to this migration

**Solution:** Check the specific error message

---

## ✨ Summary

- ✅ FIXED version resolves circular dependency
- ✅ Creates all tables, functions, and policies in correct order
- ✅ Ready to execute via Supabase Dashboard
- ✅ No more "relation does not exist" errors

**Use the FIXED version for Migration 1!**

---

**File Location:**
`database/sql/migrations/2025/20251026000001_create_tenants_table_FIXED.sql`

**Status:** ✅ Ready to execute
**Estimated Time:** 2-3 minutes
