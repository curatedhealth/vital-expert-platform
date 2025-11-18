# Database Schema Foundation - Apply BEFORE Data Migration

**CRITICAL:** These migrations MUST be applied in exact order BEFORE importing any seed data from the old database.

---

## Overview

This directory contains foundational schema setup scripts that establish the gold-standard database structure. Apply these in numerical order to:

1. Set up proper data types (ENUMs)
2. Add multi-tenancy foundation
3. Fix NULL-permissive fields
4. Normalize UUID arrays to junction tables
5. Add comprehensive indexes
6. Set up validation triggers
7. Enable Row Level Security

---

## Prerequisites

- ✅ Supabase project created
- ✅ Database credentials available
- ✅ Current schema exported (for rollback if needed)
- ✅ Backup taken (recommended)

---

## Application Method

**Option 1: Supabase Dashboard (Recommended)**
- Navigate to SQL Editor
- Copy-paste each script
- Click "Run"
- Verify success message

**Option 2: psql CLI**
```bash
PGPASSWORD='your-password' psql \
  postgresql://postgres:password@db.xxx.supabase.co:5432/postgres \
  -f migration_scripts/schema_foundation/01_enum_types.sql
```

**Option 3: Supabase CLI**
```bash
supabase db execute -f migration_scripts/schema_foundation/01_enum_types.sql
```

---

## Migration Scripts (Apply in Order)

### Phase 1: Type System Foundation (5 min)
**File:** `01_enum_types.sql`
**Purpose:** Create all ENUM types before table alterations
**Impact:** No data changes, just type definitions
**Rollback:** DROP TYPE commands provided in script

### Phase 2: Multi-Tenancy Foundation (10 min)
**File:** `02_multi_tenancy.sql`
**Purpose:** Add tenant_id to all core tables, create tenants table
**Impact:** Adds columns, creates default tenant, backfills data
**Rollback:** Included at bottom of script

### Phase 3: Fix NULL-Permissive Fields (15 min)
**File:** `03_fix_null_fields.sql`
**Purpose:** Add NOT NULL constraints to critical fields
**Impact:** Updates NULL values with defaults, adds constraints
**Rollback:** ALTER TABLE ... ALTER COLUMN ... DROP NOT NULL

### Phase 4: Convert VARCHAR to ENUMs (10 min)
**File:** `04_convert_to_enums.sql`
**Purpose:** Convert status/category VARCHAR fields to ENUMs
**Impact:** Changes column types, validates existing data
**Rollback:** Convert back to VARCHAR

### Phase 5: Normalize UUID Arrays (20 min)
**File:** `05_normalize_uuid_arrays.sql`
**Purpose:** Replace UUID[] with junction tables
**Impact:** Creates junction tables, migrates data, drops array columns
**Rollback:** Recreate array columns from junction tables

### Phase 6: Add Comprehensive Indexes (10 min)
**File:** `06_comprehensive_indexes.sql`
**Purpose:** Add all missing indexes for performance
**Impact:** Improves query performance, increases storage slightly
**Rollback:** DROP INDEX commands provided

### Phase 7: Add Validation Triggers (10 min)
**File:** `07_validation_triggers.sql`
**Purpose:** Add database-level validation logic
**Impact:** Prevents invalid data at insert/update time
**Rollback:** DROP TRIGGER commands provided

### Phase 8: Row Level Security (15 min)
**File:** `08_row_level_security.sql`
**Purpose:** Enable RLS and create tenant isolation policies
**Impact:** Enforces tenant data separation
**Rollback:** DROP POLICY and ALTER TABLE DISABLE ROW LEVEL SECURITY

---

## Verification Queries

After applying all migrations, run these queries to verify success:

```sql
-- 1. Check ENUMs created
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;

-- 2. Check tenant_id added to core tables
SELECT table_name, column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
ORDER BY table_name;

-- 3. Check NOT NULL constraints
SELECT
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('agents', 'personas', 'jobs_to_be_done', 'workflows')
  AND is_nullable = 'NO'
ORDER BY table_name, ordinal_position;

-- 4. Check junction tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%_recommendations'
ORDER BY table_name;

-- 5. Check indexes created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. Check triggers created
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. Check RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;
```

---

## Estimated Total Time

- **Phase 1-8:** ~95 minutes
- **Verification:** ~10 minutes
- **Total:** ~105 minutes (1 hour 45 minutes)

---

## After Schema Foundation Complete

Once all 8 phases are applied and verified:

1. ✅ Database structure is gold-standard
2. ✅ Ready to receive seed data from old DB
3. ✅ Multi-tenant isolation enabled
4. ✅ Data validation enforced
5. ✅ Performance optimized

**Next Step:** Run data migration scripts:
- `update_null_functional_areas.py` (infer 225 NULL values)
- `import_all_agents.py` (254 agents)
- `map_personas_by_role.py` (254 unmapped personas)
- `link_agents_to_jtbds.py` (agent recommendations)

---

## Rollback Plan

If any migration fails:

1. **Stop immediately** - Do not continue to next phase
2. **Check error message** - Usually indicates data incompatibility
3. **Run rollback SQL** - Each script has rollback section
4. **Fix data issue** - Update incompatible data
5. **Re-run migration** - Try again

**Full Rollback (Nuclear Option):**
```bash
# Restore from backup taken before migrations
pg_restore -h db.xxx.supabase.co -U postgres -d postgres backup.dump
```

---

## Support

If you encounter issues:

1. Check the error message carefully
2. Review the STRATEGIC_SCHEMA_ANALYSIS.md for context
3. Run verification queries to identify what succeeded
4. Check Supabase logs for detailed error info

---

**Created:** 2025-11-13
**Version:** 1.0
**Author:** Database Architecture Team
