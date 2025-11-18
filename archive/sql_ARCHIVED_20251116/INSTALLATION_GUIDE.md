# Market Access Roles - Installation Guide

## Overview

This guide shows you how to set up the complete Market Access role structure with **fully normalized data** (NO JSONB).

## Files You Need

### 1. Schema Setup (Run First)
**File**: `COMPLETE_MARKET_ACCESS_SETUP.sql`
- Adds 60+ columns to `org_roles` table
- Creates 18 normalized relationship tables
- Creates all necessary enums and indexes

### 2. Data Seed (Run Second)
**File**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1_normalized.sql`
- Loads 10 departments
- Loads 27 roles with full details
- Loads ~500+ normalized relationship records
- **ZERO JSONB** - all data properly normalized

## Installation Steps

### Step 1: Set Up Schema

Run the complete setup file to create all tables and columns:

```bash
psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f /Users/hichamnaim/Downloads/Cursor/VITAL\ path/database/sql/COMPLETE_MARKET_ACCESS_SETUP.sql
```

Or with password environment variable:

```bash
PGPASSWORD='flusd9fqEb4kkTJ1' psql \
  postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -f /Users/hichamnaim/Downloads/Cursor/VITAL\ path/database/sql/COMPLETE_MARKET_ACCESS_SETUP.sql
```

**What this does**:
- ✅ Adds columns to `org_roles`: reports_to, leadership_level, career_level, team_size, compensation ranges, etc.
- ✅ Creates enums: span_of_control_type, budget_authority_type, approval_limit_type, geographic_scope_type
- ✅ Creates 18 normalized tables: role_therapeutic_areas, role_company_sizes, role_technology_platforms, etc.
- ✅ Creates all necessary indexes for performance
- ✅ All operations use `IF NOT EXISTS` so it's safe to run multiple times

### Step 2: Load the Data

After the schema is ready, load the normalized data:

```bash
PGPASSWORD='flusd9fqEb4kkTJ1' psql \
  postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -f /Users/hichamnaim/Downloads/Cursor/VITAL\ path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1_normalized.sql
```

**What this does**:
- ✅ Creates/updates 10 Market Access departments
- ✅ Creates/updates 27 Market Access roles with full scalar data
- ✅ Inserts ~500+ normalized relationship records across 18 tables
- ✅ Uses `ON CONFLICT` clauses for idempotency (safe to run multiple times)

## Verification

After both steps complete, verify the data:

```sql
-- Check roles were created
SELECT
  d.name as department,
  r.name as role,
  r.seniority_level,
  r.base_salary_min_usd,
  r.base_salary_max_usd
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY d.name, r.career_level DESC;

-- Check normalized therapeutic areas
SELECT
  r.name as role,
  rta.ta_code,
  rta.is_primary,
  rta.expertise_level
FROM org_roles r
JOIN role_therapeutic_areas rta ON r.id = rta.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY r.name, rta.is_primary DESC;

-- Check technology platforms
SELECT
  r.name as role,
  rtp.platform_name,
  rtp.usage_level,
  rtp.is_required
FROM org_roles r
JOIN role_technology_platforms rtp ON r.id = rtp.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY r.name, rtp.platform_name;

-- Count all normalized data
SELECT
  'Departments' as table_name,
  COUNT(*) as record_count
FROM org_departments
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
UNION ALL
SELECT 'Roles', COUNT(*)
FROM org_roles
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
UNION ALL
SELECT 'Therapeutic Areas', COUNT(*)
FROM role_therapeutic_areas rta
JOIN org_roles r ON r.id = rta.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
UNION ALL
SELECT 'Company Sizes', COUNT(*)
FROM role_company_sizes rcs
JOIN org_roles r ON r.id = rcs.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
UNION ALL
SELECT 'Technology Platforms', COUNT(*)
FROM role_technology_platforms rtp
JOIN org_roles r ON r.id = rtp.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
UNION ALL
SELECT 'Key Activities', COUNT(*)
FROM role_key_activities rka
JOIN org_roles r ON r.id = rka.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
UNION ALL
SELECT 'KPIs', COUNT(*)
FROM role_kpis rk
JOIN org_roles r ON r.id = rk.role_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
```

## Expected Results

After successful installation:

- **10 departments** in Market Access function
- **27 roles** with complete details
- **~50+ therapeutic area assignments** (role_therapeutic_areas)
- **~100+ company size mappings** (role_company_sizes)
- **~80+ technology platform requirements** (role_technology_platforms)
- **~100+ key activities** (role_key_activities)
- **~50+ KPIs** (role_kpis)
- Plus hundreds more records in the other normalized tables

## What Makes This "Normalized"?

### Before (JSONB - NOT USED):
```sql
-- Old approach with JSONB arrays
INSERT INTO org_roles (
  ...,
  therapeutic_areas  -- '[{"ta_code": "ONCO", "is_primary": true}]'::jsonb
)
```

### After (Fully Normalized - WHAT WE USE):
```sql
-- Core role data (scalar fields only)
INSERT INTO org_roles (name, slug, description, ...)
VALUES ('Chief Market Access Officer', 'chief-market-access-officer', ...)
RETURNING id INTO v_role_id;

-- Separate table for therapeutic areas
INSERT INTO role_therapeutic_areas (role_id, ta_code, is_primary, expertise_level)
VALUES (v_role_id, 'ONCO', true, 'expert');

-- Separate table for company sizes
INSERT INTO role_company_sizes (role_id, size_code, is_typical)
VALUES (v_role_id, 'LARGE', true);
```

## Benefits

1. **Performance**: Indexed lookups, no JSON parsing
2. **Data Integrity**: Foreign key constraints, type safety
3. **Easy Queries**: Standard JOINs instead of JSON operations
4. **Schema Evolution**: Add columns without migrating JSONB
5. **Standards Compliance**: Proper 3NF database design

## Troubleshooting

### Error: "relation org_roles does not exist"
**Solution**: Make sure you're running against the correct database. Check your connection string.

### Error: "column X already exists"
**Solution**: This is fine! The script uses `IF NOT EXISTS` so it's safe to run multiple times.

### Error: "violates foreign key constraint"
**Solution**: Make sure the Market Access function exists first. The seed file checks for this and will fail early if it's missing.

### Timeout Issues
**Solution**: The schema setup should complete in < 5 seconds. The data load may take 10-30 seconds depending on your connection. If timeouts occur, check your network connection to Supabase.

## Files Reference

All files are located in:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
```

- **Schema Setup**: `database/sql/COMPLETE_MARKET_ACCESS_SETUP.sql`
- **Data Seed**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1_normalized.sql`
- **Documentation**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/README_NORMALIZED.md`
- **File Guide**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/WHICH_FILE_TO_USE.md`

## Next Steps

After successful installation:

1. Run the verification queries above
2. Explore the normalized data structure
3. Create queries using JOINs (see README_NORMALIZED.md for examples)
4. Consider loading additional parts (Part 2, Part 3) if available

---

**Summary**: Run COMPLETE_MARKET_ACCESS_SETUP.sql first, then market_access_roles_part1_normalized.sql second. Both are idempotent and safe to run multiple times.
