# How to Apply Schema Foundation via Supabase Dashboard

## ⚠️ Important: The `supabase db reset` command failed

The error was:
```
ERROR: type "vector" does not exist (SQLSTATE 42704)
```

This happened because one of your existing migrations (`20241008000001_complete_vital_schema.sql`) tries to use the `vector` type before the `pgvector` extension is enabled.

## ✅ Recommended Approach: Use Supabase Dashboard SQL Editor

Since the CLI reset failed, apply the schema foundation migrations manually via the dashboard.

---

## Step 1: Enable pgvector Extension (FIRST!)

Before applying any migrations, enable the vector extension:

1. Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/database/extensions
2. Search for "vector"
3. Click "Enable" on the `vector` extension

Or via SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Step 2: Apply Phase 1 - ENUM Types

1. Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new
2. Copy the entire contents of `01_enum_types.sql`
3. Paste into SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)

**Expected Output**:
```
✅ ENUM TYPES CREATED SUCCESSFULLY
Total enum types: [number]
✅ Ready for Phase 2: Multi-Tenancy Foundation
```

**Verification Query**:
```sql
SELECT typname, typcategory
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace = 'public'::regnamespace
ORDER BY typname;
```

You should see 14 ENUM types:
- agent_status
- complexity_type
- data_classification
- decision_type
- domain_expertise
- frequency_type
- functional_area_type
- job_category_type
- jtbd_status
- mapping_source_type
- tenant_role
- tenant_status
- tenant_tier
- validation_status

---

## Step 3: Apply Phase 2 - Multi-Tenancy

1. In SQL Editor, clear the previous query
2. Copy the entire contents of `02_multi_tenancy.sql`
3. Paste and Run

**Expected Output**:
```
✅ MULTI-TENANCY FOUNDATION COMPLETE
```

**Verification Queries**:

```sql
-- Check tenants table exists
SELECT COUNT(*) as tenant_count FROM tenants;
-- Expected: At least 1 (the default tenant)

-- Check tenant_id added to core tables
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('agents', 'personas', 'jobs_to_be_done', 'workflows')
  AND column_name = 'tenant_id'
ORDER BY table_name;
-- Expected: 4 rows showing tenant_id as uuid NOT NULL

-- Check default tenant
SELECT id, name, slug, tier, status
FROM tenants
WHERE id = '00000000-0000-0000-0000-000000000000';
-- Expected: 1 row with "Default Tenant"
```

---

## Step 4: Apply Phase 3 - Test Tenants

1. Clear SQL Editor
2. Copy the entire contents of `03_create_test_tenants.sql`
3. Paste and Run

**Expected Output**:
```
✅ Digital Health Startups tenant created
✅ Pharmaceuticals tenant created
✅ TENANT CREATION COMPLETE
```

**Verification Query**:

```sql
SELECT
  name,
  slug,
  tier,
  status,
  max_users,
  max_agents,
  features->>'max_consultations_per_month' as consultations_limit,
  metadata->>'industry_focus' as industries
FROM tenants
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
)
ORDER BY name;
```

Expected: 2 rows
- Digital Health Startups (100 users, 50 agents)
- Pharmaceuticals (500 users, 200 agents)

---

## Step 5: Fix the Broken Migration (Optional but Recommended)

The migration `20241008000001_complete_vital_schema.sql` is causing issues because it tries to use `vector` type without ensuring the extension is enabled.

**Option A: Disable the problematic migration**
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
mv supabase/migrations/20241008000001_complete_vital_schema.sql \
   supabase/migrations/20241008000001_complete_vital_schema.sql.disabled
```

**Option B: Fix the migration**
Add this at the top of `20241008000001_complete_vital_schema.sql`:
```sql
-- Enable pgvector extension FIRST
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## What if Something Goes Wrong?

### Rollback Phase 3 (Test Tenants)
```sql
-- Soft delete (RECOMMENDED)
UPDATE tenants
SET deleted_at = now()
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
```

### Rollback Phase 2 (Multi-Tenancy)
```sql
-- Remove tenant_id columns
ALTER TABLE agents DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE personas DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE jobs_to_be_done DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE workflows DROP COLUMN IF EXISTS tenant_id;

-- Drop tenant tables
DROP TABLE IF EXISTS tenant_members CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
```

### Rollback Phase 1 (ENUMs)
```sql
DROP TYPE IF EXISTS agent_status CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS domain_expertise CASCADE;
DROP TYPE IF EXISTS data_classification CASCADE;
DROP TYPE IF EXISTS functional_area_type CASCADE;
DROP TYPE IF EXISTS job_category_type CASCADE;
DROP TYPE IF EXISTS frequency_type CASCADE;
DROP TYPE IF EXISTS complexity_type CASCADE;
DROP TYPE IF EXISTS decision_type CASCADE;
DROP TYPE IF EXISTS jtbd_status CASCADE;
DROP TYPE IF EXISTS tenant_status CASCADE;
DROP TYPE IF EXISTS tenant_tier CASCADE;
DROP TYPE IF EXISTS tenant_role CASCADE;
DROP TYPE IF EXISTS mapping_source_type CASCADE;
```

---

## After Successful Application

Once all 3 phases are applied, your database will be ready for:

✅ **Data Migration** - Import agents, personas, prompts, tools, knowledge
✅ **Multi-Tenant Testing** - Test with Digital Health and Pharma tenants
✅ **Production Deployment** - Gold-standard schema foundation in place

Next steps from the [GOLD_STANDARD_DATA_STRATEGY.md](../../../migration_scripts/docs/GOLD_STANDARD_DATA_STRATEGY.md):

1. Fix NULL functional_areas (225 JTBDs)
2. Import 254 agents with tenant assignment
3. Import prompts library
4. Import tools library
5. Import knowledge bases with RAG
6. Map remaining 254 personas to JTBDs

---

## Need Help?

If you encounter any errors:

1. Check the Supabase Dashboard logs
2. Copy the exact error message
3. Run the verification queries to see what succeeded
4. Use the rollback scripts if needed

**Common Issues**:

- **"relation already exists"** - The table/type already exists, you can ignore this or the script will skip it
- **"column already exists"** - tenant_id was already added, safe to ignore
- **"constraint already exists"** - Foreign key already exists, safe to ignore
- **"type vector does not exist"** - You forgot to enable pgvector extension (Step 1)

---

**Document Created**: 2025-11-13
**Database**: bomltkhixeatxuoxmolq
**Project URL**: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
