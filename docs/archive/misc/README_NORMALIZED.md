# Market Access Roles - Fully Normalized Version

## Overview

This is the **FULLY NORMALIZED** version with **NO JSONB** columns. All data is stored in proper relational tables with foreign keys.

## Files

### 1. Schema Migration
**File**: `../../../../supabase/migrations/2025/20251115230000_create_normalized_role_tables.sql`

Creates 18 normalized tables to replace JSONB columns:
- `role_therapeutic_areas`
- `role_company_sizes`
- `role_company_types`
- `role_geographic_countries`
- `role_geographic_regions`
- `role_prior_roles`
- `role_preferred_degrees`
- `role_credentials_required`
- `role_credentials_preferred`
- `role_internal_stakeholders`
- `role_external_stakeholders`
- `role_technology_platforms`
- `role_key_activities`
- `role_kpis`
- `role_lateral_moves`
- `role_compliance_requirements`
- `role_regional_variations`

### 2. Normalized Seed File
**File**: `market_access_roles_part1_normalized.sql`

Contains:
- 10 departments
- 27 roles
- ~500+ normalized relationship records

## Comparison: Before vs After

### ❌ OLD (With JSONB)
```sql
INSERT INTO org_roles (
  ...,
  therapeutic_areas  -- JSONB: '[{"ta_code": "ONCO", "is_primary": true}]'
)
```

### ✅ NEW (Fully Normalized)
```sql
-- Core role data
INSERT INTO org_roles (name, slug, ...)
VALUES (...)
RETURNING id INTO v_role_id;

-- Separate table for therapeutic areas
INSERT INTO role_therapeutic_areas (role_id, ta_code, is_primary, expertise_level)
VALUES (v_role_id, 'ONCO', true, 'expert');
```

## Benefits of Normalization

1. **Better Query Performance**
   - Indexed lookups on specific fields
   - No JSON parsing overhead
   - Efficient JOINs

2. **Data Integrity**
   - Foreign key constraints
   - Type safety
   - NULL handling

3. **Easier Queries**
   ```sql
   -- Find all roles requiring specific credential
   SELECT r.name
   FROM org_roles r
   JOIN role_credentials_required rcr ON r.id = rcr.role_id
   WHERE rcr.credential_code = 'MBA';

   -- Find roles by therapeutic area
   SELECT r.name, rta.expertise_level
   FROM org_roles r
   JOIN role_therapeutic_areas rta ON r.id = rta.role_id
   WHERE rta.ta_code = 'ONCO'
     AND rta.is_primary = true;
   ```

4. **Flexible Schema Evolution**
   - Add columns without migrating JSONB
   - Change data types easily
   - Add constraints and validations

## Installation Steps

### Step 1: Create Normalized Tables

```bash
psql "your_connection_string" \
  -f supabase/migrations/2025/20251115230000_create_normalized_role_tables.sql
```

This creates all 18 supporting tables with proper indexes.

### Step 2: Load Core Role Columns

First, ensure `org_roles` has the basic columns (run this if needed):

```bash
psql "your_connection_string" \
  -f supabase/migrations/20251115220000_add_comprehensive_org_roles_columns.sql
```

### Step 3: Load the Normalized Data

```bash
psql "your_connection_string" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1_normalized.sql
```

## Verification Queries

### Check Data Distribution

```sql
-- Roles per department
SELECT
  d.name,
  COUNT(r.id) as role_count
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
GROUP BY d.name
ORDER BY role_count DESC;

-- Therapeutic areas coverage
SELECT
  ta_code,
  COUNT(*) as role_count,
  COUNT(*) FILTER (WHERE is_primary = true) as primary_count,
  ARRAY_AGG(expertise_level) as expertise_levels
FROM role_therapeutic_areas
GROUP BY ta_code
ORDER BY role_count DESC;

-- Most common technology platforms
SELECT
  platform_name,
  usage_level,
  COUNT(*) as role_count
FROM role_technology_platforms
GROUP BY platform_name, usage_level
ORDER BY role_count DESC;

-- Salary ranges by seniority
SELECT
  r.seniority_level,
  MIN(r.base_salary_min_usd) as min_salary,
  MAX(r.base_salary_max_usd) as max_salary,
  AVG((r.base_salary_min_usd + r.base_salary_max_usd)/2) as avg_salary
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
GROUP BY r.seniority_level
ORDER BY avg_salary DESC;
```

### Example Advanced Query

```sql
-- Find senior roles in HEOR requiring specific skills
SELECT
  r.name,
  r.seniority_level,
  r.base_salary_min_usd,
  r.base_salary_max_usd,
  ARRAY_AGG(DISTINCT rtp.platform_name) as technologies,
  ARRAY_AGG(DISTINCT rta.ta_code) as therapeutic_areas
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
LEFT JOIN role_technology_platforms rtp ON r.id = rtp.role_id
LEFT JOIN role_therapeutic_areas rta ON r.id = rta.role_id
WHERE d.slug LIKE '%heor%'
  AND r.seniority_level IN ('senior', 'executive')
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
GROUP BY r.id, r.name, r.seniority_level, r.base_salary_min_usd, r.base_salary_max_usd
ORDER BY r.career_level DESC;
```

## Schema Overview

### Core Table: `org_roles`
Stores basic role information without JSONB:
- Identity: id, tenant_id, function_id, department_id, name, slug
- Core attributes: seniority_level, leadership_level, career_level
- Team structure: team_size, direct_reports, span_of_control
- Experience: years_required (total, industry, function)
- Education: degree_level_minimum
- Budget: budget_range, authority_type, controls
- Compensation: salary_ranges, equity, bonus, ltip
- Geographic: scope_type, primary_region
- Career: typical_prior/next_role, time_in_role
- Travel: percentage, international, frequency

### Relationship Tables (1:Many)
Each role can have multiple:
- Therapeutic areas (with expertise levels)
- Company sizes/types
- Geographic countries/regions
- Prior roles (career prerequisites)
- Degrees (education requirements)
- Credentials (required & preferred)
- Stakeholders (internal & external, with interaction levels)
- Technology platforms (with usage levels)
- Key activities (with priorities)
- KPIs (with targets and frequency)
- Lateral moves (career options)
- Compliance requirements
- Regional variations

## Data Model Diagram

```
org_roles (1) ─────< (Many) role_therapeutic_areas
          │
          ├─────< role_company_sizes
          │
          ├─────< role_company_types
          │
          ├─────< role_geographic_countries
          │
          ├─────< role_geographic_regions
          │
          ├─────< role_preferred_degrees
          │
          ├─────< role_credentials_required
          │
          ├─────< role_credentials_preferred
          │
          ├─────< role_internal_stakeholders
          │
          ├─────< role_external_stakeholders
          │
          ├─────< role_technology_platforms
          │
          ├─────< role_key_activities
          │
          ├─────< role_kpis
          │
          ├─────< role_lateral_moves
          │
          ├─────< role_compliance_requirements
          │
          └─────< role_regional_variations
```

## Regenerating the Seed File

To regenerate from the JSON source:

```bash
python3 scripts/generate_market_access_roles_normalized.py
```

This will create a fresh `market_access_roles_part1_normalized.sql` file.

## Troubleshooting

### Error: "relation does not exist"

**Problem**: Normalized tables haven't been created.

**Solution**: Run Step 1 (create normalized tables) first.

### Error: "column does not exist"

**Problem**: Core `org_roles` table is missing columns.

**Solution**: Run the comprehensive columns migration first.

### Duplicate Key Violations

**Problem**: Data already exists in relationship tables.

**Solution**: The seed file should handle conflicts. If not, manually truncate the relationship tables first:

```sql
TRUNCATE
  role_therapeutic_areas,
  role_company_sizes,
  role_company_types,
  role_geographic_countries,
  role_geographic_regions,
  role_preferred_degrees,
  role_credentials_required,
  role_credentials_preferred,
  role_internal_stakeholders,
  role_external_stakeholders,
  role_technology_platforms,
  role_key_activities,
  role_kpis,
  role_lateral_moves,
  role_compliance_requirements,
  role_regional_variations
CASCADE;
```

## Performance Considerations

All normalized tables have indexes on:
- `role_id` (for lookups by role)
- Specific code/name fields (for filtering)
- Primary/typical flags (for optimized queries)

Indexes are automatically created by the migration.

## Summary

✅ **Zero JSONB columns**
✅ **18 normalized relationship tables**
✅ **Proper foreign keys and indexes**
✅ **Type-safe and queryable**
✅ **Easy to extend and maintain**

All data from the original JSON is preserved in a fully normalized structure.
