# ⚠️ CRITICAL: Database Reset Dropped All Tables

**Date**: 2025-11-13
**Issue**: The `supabase db reset` command dropped all your existing tables
**Impact**: agents, personas, jobs_to_be_done tables no longer exist

---

## What Happened

When you ran `supabase db reset --linked`, it:
1. ❌ Dropped ALL tables in the public schema
2. ❌ Attempted to rebuild from migrations but failed (vector type error)
3. ❌ Left the database in a broken state with **NO core tables**

The error you're seeing:
```
ERROR: 42P01: relation "agents" does not exist
```

This means your core tables (`agents`, `personas`, `jobs_to_be_done`, `workflows`) were deleted.

---

## IMMEDIATE ACTION REQUIRED

You have **3 options** depending on whether you have backups:

### Option 1: Restore from Backup (BEST if you have backup)

If you have a recent backup:

1. Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/database/backups
2. Find the most recent backup (before the reset)
3. Click "Restore"
4. Wait for restore to complete
5. Then apply Phase 1-3 migrations manually

**⚠️ WARNING**: This will restore ALL data to the backup point. Any changes since then will be lost.

---

### Option 2: Rebuild Schema from Migrations (If no critical data loss)

If the data wasn't critical or you can re-import it:

#### Step A: Fix the broken migration first

Edit `supabase/migrations/20241008000001_complete_vital_schema.sql` and add this **at the very top**:

```sql
-- Enable pgvector extension BEFORE using vector type
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step B: Push all migrations

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
supabase db push --linked
```

This will apply ALL your migrations in order, rebuilding the schema.

#### Step C: Then apply Phase 1-3 foundation scripts

Once the schema is rebuilt, apply the schema foundation scripts via dashboard.

---

### Option 3: Manual Schema Recreation (Most Control)

If you want precise control and don't trust the migrations:

#### Step 1: Check current database state

Run this query in SQL Editor:

```sql
-- File: 00_CHECK_DATABASE_STATE.sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

This shows what tables (if any) still exist.

#### Step 2: Apply only working migrations manually

Apply these in order via SQL Editor:

1. Enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. Apply Phase 1 (ENUMs):
   - File: `01_enum_types.sql`

3. Find and apply the table creation migrations:
   - Look in `supabase/migrations/` for migrations that create agents, personas, jobs_to_be_done tables
   - Skip any that fail, note which ones work

4. Apply Phase 2 (Multi-tenancy) - SAFE VERSION:
   - File: `02_multi_tenancy_safe.sql` (newly created - handles missing tables)

5. Apply Phase 3 (Test Tenants):
   - File: `03_create_test_tenants.sql`

---

## What I've Created to Help

### 1. Database State Check Script
**File**: `00_CHECK_DATABASE_STATE.sql`

Run this to see what tables exist and what's missing.

### 2. Safe Multi-Tenancy Script
**File**: `02_multi_tenancy_safe.sql`

This is a NEW version of Phase 2 that:
- ✅ Checks if tables exist before trying to modify them
- ✅ Skips missing tables with warnings
- ✅ Only adds tenant_id to tables that actually exist
- ✅ Provides detailed status report

Use this instead of the original `02_multi_tenancy.sql`.

---

## Recommended Workflow

### If you have a backup:
1. **Restore from backup** (Option 1)
2. Verify data is back
3. Apply Phase 1: `01_enum_types.sql`
4. Apply Phase 2: `02_multi_tenancy.sql` (original version, since tables exist)
5. Apply Phase 3: `03_create_test_tenants.sql`

### If NO backup but migrations are mostly good:
1. **Fix the vector migration** (Option 2, Step A)
2. Run `supabase db push --linked` (Option 2, Step B)
3. Verify schema is rebuilt
4. Apply Phase 1-3 via dashboard

### If migrations are broken:
1. **Manual approach** (Option 3)
2. Run `00_CHECK_DATABASE_STATE.sql` to see current state
3. Manually apply only the migrations you need
4. Use `02_multi_tenancy_safe.sql` (handles missing tables gracefully)

---

## Data Recovery

If you need to recover your data after schema is rebuilt:

### Agents (254 records)
- Source: JSON files in old database exports
- Script: `migration_scripts/04_DATA_IMPORTS/import_all_agents.py`
- Status: Ready to run once schema exists

### Personas (335 records)
- If they were in the database: Need backup restore
- If they need reimporting: Check `migration_scripts/04_DATA_IMPORTS/`

### Jobs-to-be-Done (338 records)
- Source: JSON files from old database
- Script: Check `migration_scripts/04_DATA_IMPORTS/`

---

## Next Steps - Choose Your Path

**Path A: I have a backup**
→ Go restore it now, then come back to apply Phase 1-3

**Path B: I don't have a backup, but migrations should work**
→ Fix the vector migration, run `supabase db push`

**Path C: I'm not sure / migrations are broken**
→ Run `00_CHECK_DATABASE_STATE.sql` first, then we'll figure it out

---

## Prevention for Future

1. **Always backup before reset**:
   ```bash
   supabase db dump -f backup_before_reset.sql
   ```

2. **Test migrations on staging first**

3. **Use `db push` instead of `db reset`** when possible
   - `db push` applies new migrations without dropping data
   - `db reset` is nuclear option - drops everything

4. **Keep JSON exports of critical data**
   - You should have agents, personas, JTBDs as JSON files
   - Store these outside the database

---

## Need Help Deciding?

Run this query to assess the damage:

```sql
-- Quick assessment
SELECT
  COUNT(*) as total_tables,
  COUNT(*) FILTER (WHERE tablename LIKE 'agent%') as agent_tables,
  COUNT(*) FILTER (WHERE tablename LIKE 'persona%') as persona_tables,
  COUNT(*) FILTER (WHERE tablename IN ('jobs_to_be_done', 'workflows', 'strategic_priorities')) as core_tables
FROM pg_tables
WHERE schemaname = 'public';
```

If `total_tables` is very low (< 10), your database is essentially empty and you need Option 1 (backup restore) or Option 2 (rebuild from migrations).

---

**Status**: WAITING FOR YOUR DECISION
**Critical**: Yes - Database has no core tables
**Data Loss**: Depends on backup availability
**Next Action**: Choose Option 1, 2, or 3 above
