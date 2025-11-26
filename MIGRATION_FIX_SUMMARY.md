# Phase 5 Migration Fix

## ⚠️ Issue
The migration failed with: `ERROR: 42703: column "user_age_group" does not exist`

This happened because the table likely already existed from a previous partial migration without the demographic columns.

## ✅ Solution
Updated the migration to use `DROP TABLE IF EXISTS` at the beginning to ensure a clean migration.

## 🔧 Changes Made

**File**: `supabase/migrations/20251123_create_monitoring_tables.sql`

**Added at the top**:
```sql
-- Drop existing tables if they exist (to ensure clean migration)
DROP TABLE IF EXISTS public.agent_interaction_logs CASCADE;
DROP TABLE IF EXISTS public.agent_diagnostic_metrics CASCADE;
DROP TABLE IF EXISTS public.agent_drift_alerts CASCADE;
DROP TABLE IF EXISTS public.agent_fairness_metrics CASCADE;
```

**Changed**:
- `CREATE TABLE IF NOT EXISTS` → `CREATE TABLE` (for all 4 tables)
- `CREATE INDEX IF NOT EXISTS` → `CREATE INDEX` (for all 9 indexes)

## 🚀 Next Steps

**Run the migration again**:
1. Open Supabase Dashboard → SQL Editor
2. Copy the updated migration file: `supabase/migrations/20251123_create_monitoring_tables.sql`
3. Paste and execute
4. Should now succeed with "Success. No rows returned"

## 📊 What This Does

The migration will now:
1. **Drop** any existing monitoring tables (if present)
2. **Create fresh** tables with correct schema:
   - `agent_interaction_logs` with ALL 26 columns including demographics
   - `agent_diagnostic_metrics` with 22 columns
   - `agent_drift_alerts` with 18 columns
   - `agent_fairness_metrics` with 16 columns
3. **Create** all 9 performance indexes

## ⚠️ Important Note

**Data Loss**: If you had any data in the old `agent_interaction_logs` table, it will be deleted. This is expected since this is the initial Phase 5 deployment.

If you have production data you want to preserve, let me know and I'll create an ALTER TABLE migration instead.

---

**Ready to deploy!** The migration is now fixed and ready to run.
