# Market Access Roles - Setup Instructions

## Overview
This guide helps you load the Market Access roles data from the normalized JSON file into your database.

## Files Generated

1. **[market_access_roles_part1.sql](market_access_roles_part1.sql)** - 3,165 lines
   - SQL seed file with 10 departments and 27 roles
   - Generated from `MARKET_ACCESS_ROLES_PART1_NORMALIZED.json`

2. **[Migration File](../../../../supabase/migrations/20251115220000_add_comprehensive_org_roles_columns.sql)**
   - Adds ~60 columns to `org_roles` table
   - Creates necessary ENUM types
   - Adds indexes for performance

3. **[Python Generator Script](../../../../scripts/generate_market_access_roles_seed.py)**
   - Regenerate SQL from JSON if needed
   - Handles proper SQL escaping and JSONB conversion

## Prerequisites

### Step 1: Check Current Database Schema

First, verify which columns exist in your `org_roles` table:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'org_roles'
ORDER BY ordinal_position;
```

### Step 2: Identify Missing Columns

Compare your current schema with the required columns. The seed file expects these columns:

**Core Identity:**
- tenant_id, function_id, department_id
- name, slug, description
- seniority_level, leadership_level, career_level

**Reporting Structure:**
- reports_to, dotted_line_reports_to

**Team Structure:**
- team_size_min, team_size_max
- direct_reports_min, direct_reports_max
- layers_below, span_of_control

**Experience Requirements:**
- years_total_min, years_total_max
- years_industry_min, years_function_min
- prior_roles (JSONB)

**Education:**
- degree_level_minimum
- preferred_degrees (JSONB)
- credentials_required (JSONB)
- credentials_preferred (JSONB)

**Budget Authority:**
- budget_min_usd, budget_max_usd
- budget_authority_type (ENUM)
- controls_headcount, controls_contractors
- approval_limits (ENUM)

**Compensation:**
- base_salary_min_usd, base_salary_max_usd
- total_comp_min_usd, total_comp_max_usd
- equity_eligible, bonus_target_percentage, ltip_eligible

**Geographic Scope:**
- geographic_scope_type (ENUM)
- geographic_regions (JSONB)
- geographic_primary_region
- geographic_countries (JSONB)

**Context:**
- therapeutic_areas (JSONB)
- company_sizes (JSONB)
- company_types (JSONB)

**Stakeholders:**
- internal_stakeholders (JSONB)
- external_stakeholders (JSONB)

**Technology & Activities:**
- technology_platforms (JSONB)
- key_activities (JSONB)
- kpis (JSONB)

**Career Progression:**
- typical_prior_role, typical_next_role
- lateral_moves (JSONB)
- time_in_role_years_min, time_in_role_years_max

**Travel:**
- travel_percentage_min, travel_percentage_max
- international_travel
- overnight_travel_frequency

**Compliance:**
- compliance_requirements (JSONB)
- regional_variations (JSONB)

## Installation Steps

### Option A: If Columns Are Missing

#### 1. Run the Migration

```bash
# Connect to your database
psql "your_connection_string_here" \
  -f supabase/migrations/20251115220000_add_comprehensive_org_roles_columns.sql
```

This will:
- Add all missing columns with proper defaults
- Create ENUM types (span_of_control_type, budget_authority_type, etc.)
- Add indexes for performance
- NOT delete or modify existing data

#### 2. Verify Migration Success

```sql
-- Count columns
SELECT COUNT(*)
FROM information_schema.columns
WHERE table_name = 'org_roles';
-- Should return ~70+ columns

-- Check ENUMs created
SELECT typname FROM pg_type
WHERE typname IN (
  'span_of_control_type',
  'budget_authority_type',
  'approval_limit_type',
  'geographic_scope_type'
);
```

#### 3. Load the Seed Data

```bash
# Run the seed file
psql "your_connection_string_here" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1.sql
```

### Option B: If All Columns Exist

If your schema already has all columns, skip the migration and go straight to loading:

```bash
psql "your_connection_string_here" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1.sql
```

## Verification

After loading, verify the data:

```sql
-- Check department count
SELECT COUNT(*) as dept_count
FROM org_departments
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id IN (
    SELECT id FROM org_functions WHERE slug = 'market-access'
  );
-- Expected: 10

-- Check role count
SELECT COUNT(*) as role_count
FROM org_roles
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id IN (
    SELECT id FROM org_functions WHERE slug = 'market-access'
  );
-- Expected: 27

-- View roles by department
SELECT
  d.name as department,
  COUNT(r.id) as role_count,
  ARRAY_AGG(r.name ORDER BY r.career_level DESC) as roles
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.function_id IN (
    SELECT id FROM org_functions WHERE slug = 'market-access'
  )
GROUP BY d.name
ORDER BY d.name;
```

## Troubleshooting

### Error: "column does not exist"

**Problem:** Trying to insert columns that don't exist in the table.

**Solution:** Run the migration first (Step A1 above).

### Error: "Market Access function not found"

**Problem:** The `org_functions` table doesn't have a Market Access function.

**Solution:** First create the function:

```sql
INSERT INTO org_functions (tenant_id, name, slug, description, is_active)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  'Market Access',
  'market-access',
  'Market access and payer strategy function',
  true
)
ON CONFLICT (tenant_id, slug) DO NOTHING;
```

### Error: "type does not exist"

**Problem:** Missing ENUM types.

**Solution:** The migration creates these. Ensure you ran the migration successfully.

### Duplicate Key Errors

**Problem:** Data already exists.

**Solution:** The seed file uses `ON CONFLICT` to update existing records. This is safe to re-run.

## Regenerating the SQL

If you need to regenerate from the JSON source:

```bash
python3 scripts/generate_market_access_roles_seed.py
```

This will overwrite the existing seed file with fresh SQL.

## Database Connection

Replace `your_connection_string_here` with your actual connection string:

For Supabase:
```
postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_REF.supabase.co:5432/postgres
```

For local PostgreSQL:
```
postgresql://username:password@localhost:5432/database_name
```

## Support

If you encounter issues:

1. Check the column names in your schema match expectations
2. Verify ENUM types are created
3. Ensure the Market Access function exists
4. Check that the tenant_id matches your data

## Summary

- **Without missing columns**: Run seed file directly
- **With missing columns**: Run migration first, then seed file
- **Always**: Verify data after loading

All seed file operations are idempotent and safe to re-run.
