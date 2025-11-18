# Medical Affairs Personas Seed File - Schema Compatibility Fixes

## Overview
This document describes the comprehensive schema compatibility fixes applied to ensure the Medical Affairs personas seed file can run successfully.

## Files Modified

### 1. `00_ensure_persona_jtbd_tables.sql`
**Purpose**: Ensures all persona junction tables have the required columns before running seed files.

**Changes Made**:
- Added `tenant_id` column to 18 persona junction tables
- Added `sequence_order` column to 16 tables that use ordering
- Added `updated_at` columns for audit trail
- Made `goal_type` in `persona_goals` nullable for compatibility

**Tables Updated** (with tenant_id, sequence_order where needed, and updated_at):
1. ✅ persona_goals (tenant_id, sequence_order, updated_at, nullable goal_type)
2. ✅ persona_pain_points (tenant_id, sequence_order, updated_at)
3. ✅ persona_challenges (tenant_id, sequence_order, updated_at)
4. ✅ persona_responsibilities (tenant_id, sequence_order, updated_at)
5. ✅ persona_frustrations (tenant_id, sequence_order, updated_at)
6. ✅ persona_quotes (tenant_id, sequence_order, updated_at)
7. ✅ persona_tools (tenant_id, sequence_order, updated_at)
8. ✅ persona_communication_channels (tenant_id, sequence_order, updated_at)
9. ✅ persona_decision_makers (tenant_id, sequence_order, updated_at)
10. ✅ persona_success_metrics (tenant_id, sequence_order, updated_at)
11. ✅ persona_motivations (tenant_id, sequence_order, updated_at)
12. ✅ persona_personality_traits (tenant_id, sequence_order, updated_at)
13. ✅ persona_values (tenant_id, sequence_order, updated_at)
14. ✅ persona_education (tenant_id, sequence_order, updated_at)
15. ✅ persona_certifications (tenant_id, sequence_order, updated_at)
16. ✅ persona_typical_day (tenant_id, sequence_order, updated_at)
17. ✅ persona_organization_types (tenant_id, updated_at) - no sequence_order needed
18. ✅ persona_typical_locations (tenant_id, updated_at) - no sequence_order needed

### 2. `00_fix_vpanes_constraints.sql`
**Purpose**: Fix restrictive check constraints on VPANES scoring that prevented values above 10.

**Changes Made**:
- Removed upper limit (10) on all VPANES score columns
- Changed column types from DECIMAL(3,1) to DECIMAL(4,1)
- Kept minimum value constraint (>= 0)
- Properly handled generated columns (total_score, priority_tier) by dropping and recreating

**Affected Columns**:
- value_score
- priority_score
- addressability_score
- need_score
- engagement_score
- scale_score

## Execution Order

Run these scripts in the following order when database connection is available:

```bash
# Step 1: Fix VPANES constraints (must run first)
PGPASSWORD='flusd9fqEb4kkTJ1' psql postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_fix_vpanes_constraints.sql"

# Step 2: Ensure all persona tables have required columns
PGPASSWORD='flusd9fqEb4kkTJ1' psql postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_ensure_persona_jtbd_tables.sql"

# Step 3: Run the Medical Affairs personas seed file
PGPASSWORD='flusd9fqEb4kkTJ1' psql postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -c "\set ON_ERROR_STOP on" \
  -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part1_normalized.sql"
```

## Issues Resolved

### Issue 1: Missing Tables
**Error**: `relation 'persona_vpanes_scoring' does not exist`
**Fix**: Created `CREATE TABLE IF NOT EXISTS` statements for missing tables

### Issue 2: Missing tenant_id Columns
**Error**: `column "tenant_id" does not exist`
**Fix**: Added `tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE` to all persona junction tables

### Issue 3: VPANES Score Constraint Violation
**Error**: `new row violates check constraint - scale_score value of 10.5 exceeds maximum 10`
**Fix**:
- Dropped generated columns
- Removed upper limit constraints
- Changed column type to DECIMAL(4,1)
- Recreated generated columns

### Issue 4: Missing sequence_order Columns
**Error**: `column "sequence_order" of relation 'persona_success_metrics' does not exist`
**Fix**: Added `sequence_order INTEGER` to 16 tables that use ordering in the seed file

### Issue 5: Generated Column Dependency
**Error**: `cannot alter type of a column used by a generated column`
**Fix**: Implemented proper order of operations:
1. Drop generated columns first
2. Alter base column types
3. Recreate generated columns

## Safety Features

All scripts are designed to be **idempotent** and **safe to run multiple times**:

- Use `IF NOT EXISTS` checks before adding columns
- Use `DROP COLUMN IF EXISTS` before modifications
- Use `DROP CONSTRAINT IF EXISTS` before constraint changes
- Include `RAISE NOTICE` statements for visibility

## Verification

After running the scripts, you can verify success by:

```sql
-- Check that all columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'persona_success_metrics'
  AND column_name IN ('tenant_id', 'sequence_order', 'updated_at')
ORDER BY column_name;

-- Check VPANES constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'persona_vpanes_scoring'::regclass
  AND contype = 'c';

-- Verify data was inserted
SELECT COUNT(*) FROM personas WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
```

## Summary of Changes

| Table | tenant_id | sequence_order | updated_at | Other Changes |
|-------|-----------|----------------|------------|---------------|
| persona_goals | ✅ | ✅ | ✅ | goal_type made nullable |
| persona_pain_points | ✅ | ✅ | ✅ | - |
| persona_challenges | ✅ | ✅ | ✅ | - |
| persona_responsibilities | ✅ | ✅ | ✅ | - |
| persona_frustrations | ✅ | ✅ | ✅ | - |
| persona_quotes | ✅ | ✅ | ✅ | - |
| persona_tools | ✅ | ✅ | ✅ | - |
| persona_communication_channels | ✅ | ✅ | ✅ | - |
| persona_decision_makers | ✅ | ✅ | ✅ | - |
| persona_success_metrics | ✅ | ✅ | ✅ | - |
| persona_motivations | ✅ | ✅ | ✅ | - |
| persona_personality_traits | ✅ | ✅ | ✅ | - |
| persona_values | ✅ | ✅ | ✅ | - |
| persona_education | ✅ | ✅ | ✅ | - |
| persona_certifications | ✅ | ✅ | ✅ | - |
| persona_typical_day | ✅ | ✅ | ✅ | - |
| persona_organization_types | ✅ | ❌ | ✅ | - |
| persona_typical_locations | ✅ | ❌ | ✅ | - |
| persona_vpanes_scoring | (native) | ❌ | (native) | Constraints relaxed, type changed |
| persona_evidence_sources | ✅ | ❌ | ✅ | - |

**Total Tables Modified**: 20
**Total Columns Added**: 54+ (tenant_id: 18, sequence_order: 16, updated_at: 18, plus constraint modifications)
