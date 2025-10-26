# VITAL Platform - Multi-Tenant Database Migrations
**Created:** October 26, 2025
**Status:** ✅ READY FOR EXECUTION
**Impact:** BREAKING CHANGES - Introduces multi-tenant architecture

---

## 📋 OVERVIEW

These migrations implement production-ready multi-tenant architecture for VITAL Platform, enabling:
- **4 Tenant Types**: client, solution, industry, platform
- **Resource Sharing**: Platform-wide shared agents, tools, prompts, workflows
- **Tenant Isolation**: Row-Level Security with automatic filtering
- **MVP Launch**: Digital Health Startup tenant ready to deploy

---

## 🎯 MIGRATIONS OVERVIEW

| Migration | File | Purpose | Execution Time |
|-----------|------|---------|----------------|
| **#1** | `20251026000001_create_tenants_table.sql` | Create tenants table, user associations, helper functions | ~5 seconds |
| **#2** | `20251026000002_add_tenant_columns_to_resources.sql` | Add tenant columns to all resource tables | ~10 seconds |
| **#3** | `20251026000003_update_rls_policies.sql` | Implement RLS policies for tenant isolation + sharing | ~15 seconds |
| **#4** | `20251026000004_seed_mvp_tenants.sql` | Seed platform + digital-health-startup tenants | ~5 seconds |

**Total Execution Time:** ~35 seconds

---

## ⚠️ PRE-MIGRATION CHECKLIST

### 1. Backup Database
```bash
# Create full backup before running migrations
pg_dump -h YOUR_HOST -U postgres -d YOUR_DB > backup_pre_multitenant_$(date +%Y%m%d).sql
```

### 2. Verify Current State
```sql
-- Check if any existing tenants
SELECT COUNT(*) FROM tenants;  -- Should fail (table doesn't exist yet)

-- Check existing agents
SELECT COUNT(*), COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as user_created
FROM agents;

-- Verify no tenant_id column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'agents' AND column_name = 'tenant_id';  -- Should return 0 rows
```

### 3. Verify Supabase Connection
```bash
# If using Supabase, verify you have service_role key
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
```

---

## 🚀 EXECUTION INSTRUCTIONS

### Method 1: Sequential Execution (Recommended)

Execute migrations in order. Each migration is idempotent (safe to re-run).

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/2025"

# Migration 1: Tenants Table
psql -h YOUR_HOST -U postgres -d YOUR_DB -f 20251026000001_create_tenants_table.sql

# Verify Migration 1
psql -h YOUR_HOST -U postgres -d YOUR_DB -c "SELECT COUNT(*) FROM tenants;"

# Migration 2: Add Tenant Columns
psql -h YOUR_HOST -U postgres -d YOUR_DB -f 20251026000002_add_tenant_columns_to_resources.sql

# Verify Migration 2
psql -h YOUR_HOST -U postgres -d YOUR_DB -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'agents' AND column_name IN ('tenant_id', 'is_shared');"

# Migration 3: RLS Policies
psql -h YOUR_HOST -U postgres -d YOUR_DB -f 20251026000003_update_rls_policies.sql

# Verify Migration 3
psql -h YOUR_HOST -U postgres -d YOUR_DB -c "SELECT COUNT(*) FROM pg_policies WHERE policyname LIKE '%_with_sharing';"

# Migration 4: Seed Tenants
psql -h YOUR_HOST -U postgres -d YOUR_DB -f 20251026000004_seed_mvp_tenants.sql

# Verify Migration 4
psql -h YOUR_HOST -U postgres -d YOUR_DB -c "SELECT slug, type, subscription_tier FROM tenants;"
```

### Method 2: Supabase Dashboard (If using Supabase)

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of each migration file
3. Execute in order (1 → 2 → 3 → 4)
4. Check "Notices" tab for success messages

### Method 3: Automated Script

```bash
#!/bin/bash
# run-multitenant-migrations.sh

DB_HOST="YOUR_HOST"
DB_USER="postgres"
DB_NAME="YOUR_DB"
MIGRATION_DIR="/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/2025"

echo "Starting multi-tenant migrations..."

for migration in \
  20251026000001_create_tenants_table.sql \
  20251026000002_add_tenant_columns_to_resources.sql \
  20251026000003_update_rls_policies.sql \
  20251026000004_seed_mvp_tenants.sql
do
  echo "Running $migration..."
  psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$MIGRATION_DIR/$migration"

  if [ $? -eq 0 ]; then
    echo "✅ $migration completed successfully"
  else
    echo "❌ $migration failed"
    exit 1
  fi
done

echo "All migrations completed successfully!"
```

---

## ✅ POST-MIGRATION VERIFICATION

### 1. Verify Tenants Created
```sql
SELECT
    slug,
    type,
    subscription_tier,
    status
FROM tenants
ORDER BY type, slug;

-- Expected result:
-- slug                    | type     | subscription_tier | status
-- ----------------------- | -------- | ----------------- | ------
-- vital-platform          | platform | enterprise        | active
-- digital-health-startup  | industry | professional      | active
```

### 2. Verify Platform Agents Assigned
```sql
SELECT
    COUNT(*) as total_agents,
    COUNT(CASE WHEN is_shared = true THEN 1 END) as shared_agents,
    COUNT(CASE WHEN resource_type = 'platform' THEN 1 END) as platform_agents
FROM agents
WHERE deleted_at IS NULL;

-- All existing agents should now be platform-owned and shared
```

### 3. Test Tenant Context & Resource Access
```sql
-- Get Digital Health Startup tenant ID
SELECT id FROM tenants WHERE slug = 'digital-health-startup';
-- Copy the UUID, use in next query

-- Set tenant context
SELECT set_tenant_context('PASTE_DH_STARTUP_TENANT_ID_HERE');

-- Get accessible agents (should return all platform agents)
SELECT * FROM get_accessible_agents('PASTE_DH_STARTUP_TENANT_ID_HERE')
LIMIT 10;

-- Verify platform agents are visible
SELECT COUNT(*) FROM agents;  -- Should see all platform agents due to RLS
```

### 4. Test RLS Isolation
```sql
-- Create a test private agent for DH Startup
INSERT INTO agents (
    tenant_id,
    name,
    display_name,
    description,
    system_prompt,
    model,
    capabilities,
    is_shared,
    sharing_mode,
    resource_type
)
SELECT
    id,  -- DH Startup tenant ID
    'test-private-agent',
    'Test Private Agent',
    'Private agent for testing',
    'You are a test agent',
    'gpt-4',
    ARRAY['testing'],
    false,  -- Not shared
    'private',
    'custom'
FROM tenants
WHERE slug = 'digital-health-startup';

-- Verify only DH Startup can see it (when context is set)
SELECT set_tenant_context((SELECT id FROM tenants WHERE slug = 'digital-health-startup'));
SELECT COUNT(*) FROM agents WHERE name = 'test-private-agent';  -- Should return 1

-- Switch to platform tenant context
SELECT set_tenant_context((SELECT id FROM tenants WHERE slug = 'vital-platform'));
SELECT COUNT(*) FROM agents WHERE name = 'test-private-agent';  -- Should return 0 (isolated!)

-- Platform admin can still see it (bypass)
SELECT COUNT(*) FROM agents WHERE name = 'test-private-agent';  -- Returns 1 if user is platform admin
```

---

## 👥 POST-MIGRATION USER SETUP

### 1. Grant Platform Admin Access
```sql
-- Get your user ID from auth.users
SELECT id, email FROM auth.users LIMIT 5;

-- Grant platform admin to your user
SELECT grant_platform_admin('YOUR_USER_UUID_HERE');
```

### 2. Assign Users to Digital Health Startup Tenant
```sql
-- Assign a user as admin
SELECT assign_user_to_dh_startup('USER_UUID_HERE', 'admin');

-- Assign a user as member
SELECT assign_user_to_dh_startup('USER_UUID_HERE', 'member');

-- Verify assignments
SELECT
    u.email,
    t.name as tenant_name,
    ut.role,
    ut.status
FROM user_tenants ut
JOIN tenants t ON ut.tenant_id = t.id
JOIN auth.users u ON ut.user_id = u.id
WHERE t.slug = 'digital-health-startup';
```

---

## 🔧 TROUBLESHOOTING

### Issue: Migration fails with "relation already exists"
**Solution:** Migrations are idempotent. This is expected if re-running. Check for actual errors.

### Issue: Agents table has no tenant_id after Migration 2
**Solution:**
```sql
-- Verify column was added
\d agents

-- If missing, manually add:
ALTER TABLE agents ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
```

### Issue: RLS blocking all queries
**Solution:**
```sql
-- Disable RLS temporarily for debugging
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Or set tenant context properly
SELECT set_tenant_context((SELECT id FROM tenants WHERE slug = 'digital-health-startup'));
```

### Issue: Platform agents not visible to DH Startup
**Solution:**
```sql
-- Verify agents are marked as shared
SELECT COUNT(*) FROM agents WHERE is_shared = true AND sharing_mode = 'global';

-- If none, re-run Migration 4 section 3
UPDATE agents
SET
    tenant_id = (SELECT id FROM tenants WHERE slug = 'vital-platform'),
    is_shared = true,
    sharing_mode = 'global',
    resource_type = 'platform'
WHERE tenant_id IS NULL AND deleted_at IS NULL;
```

---

## 🎨 ARCHITECTURE BENEFITS

### Before Multi-Tenant
```
┌─────────────────────────────────────┐
│  All Users                          │
│  └── See ALL agents (no isolation)  │
│  └── No tenant concept             │
│  └── No resource sharing           │
└─────────────────────────────────────┘
```

### After Multi-Tenant
```
┌──────────────────────────────────────────────────────┐
│  VITAL Platform (vital-platform)                     │
│  ├── Owns 250+ shared agents                        │
│  ├── Owns shared tools, prompts, workflows         │
│  └── Globally accessible to all tenants             │
└──────────────────────────────────────────────────────┘
                         ↓ SHARES WITH
┌──────────────────────────────────────────────────────┐
│  Digital Health Startup (digital-health-startup)     │
│  ├── Access: All 250+ platform agents ✓            │
│  ├── Can create: Up to 50 custom agents            │
│  ├── Private: Custom agents isolated               │
│  └── Cannot see: Other tenants' private resources  │
└──────────────────────────────────────────────────────┘

Future Tenants (Easy to add):
├── takeda.vital.expert (Client Tenant)
├── pfizer.vital.expert (Client Tenant)
└── launch-excellence.vital.expert (Solution Tenant)
```

---

## 📝 ROLLBACK INSTRUCTIONS (If Needed)

**⚠️ WARNING: This will delete all tenant data!**

```sql
-- Rollback in reverse order

-- Drop Migration 4 artifacts
DROP FUNCTION IF EXISTS assign_user_to_dh_startup(UUID, VARCHAR);
DROP FUNCTION IF EXISTS grant_platform_admin(UUID);
DELETE FROM tenants WHERE slug IN ('vital-platform', 'digital-health-startup');

-- Drop Migration 3 artifacts
DROP MATERIALIZED VIEW IF EXISTS mv_platform_shared_resources CASCADE;
DROP TABLE IF EXISTS resource_sharing_audit CASCADE;
DROP POLICY IF EXISTS "agents_select_with_sharing" ON agents;
-- ... (drop all RLS policies)

-- Drop Migration 2 artifacts
ALTER TABLE agents DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE agents DROP COLUMN IF EXISTS is_shared;
ALTER TABLE agents DROP COLUMN IF EXISTS sharing_mode;
ALTER TABLE agents DROP COLUMN IF EXISTS shared_with;
ALTER TABLE agents DROP COLUMN IF EXISTS resource_type;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;

-- Drop Migration 1 artifacts
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_tenants CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP FUNCTION IF EXISTS get_super_admin_tenant_id();
DROP FUNCTION IF EXISTS is_platform_admin(UUID);
DROP FUNCTION IF EXISTS has_tenant_access(UUID, UUID);

-- Restore from backup
-- psql -h YOUR_HOST -U postgres -d YOUR_DB < backup_pre_multitenant_YYYYMMDD.sql
```

---

## 🚀 NEXT STEPS AFTER MIGRATION

1. **Update Application Code**
   - Implement tenant context middleware
   - Create tenant-aware Supabase client
   - Update API routes to use tenant context

2. **Test Thoroughly**
   - Verify tenant isolation
   - Test resource sharing
   - Validate RLS policies

3. **Deploy Frontend Changes**
   - Add tenant context provider
   - Update resource browsers
   - Show "Platform" vs "Your Agents"

4. **Monitor & Optimize**
   - Watch query performance
   - Refresh materialized views periodically
   - Monitor tenant resource usage

---

## 📚 ADDITIONAL RESOURCES

- **Gold Standard Architecture:** `/Users/hichamnaim/Downloads/VITAL_GOLD_STANDARD_MULTI_TENANT_ARCHITECTURE.md`
- **Shared Resources Architecture:** `/Users/hichamnaim/Downloads/VITAL_SHARED_RESOURCES_ARCHITECTURE.md`
- **Implementation Progress:** `MULTI_TENANT_IMPLEMENTATION_PROGRESS.md`
- **Audit Report:** `MULTI_TENANT_ARCHITECTURE_AUDIT_REPORT.md`

---

**Prepared By:** Claude (Anthropic)
**Date:** October 26, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
