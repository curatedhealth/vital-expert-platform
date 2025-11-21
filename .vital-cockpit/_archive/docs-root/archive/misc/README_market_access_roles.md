# Market Access Roles Seed File

## Overview
This directory contains SQL seed files generated from normalized JSON data for Market Access organizational structure.

## Generated Files

### `market_access_roles_part1.sql`
- **Source**: `/Users/hichamnaim/Downloads/MARKET_ACCESS_ROLES_PART1_NORMALIZED.json`
- **Generated**: 2025-11-15
- **Version**: 4.0-Complete-Detailed
- **Content**: Part 1 of 2 - Roles 1-27 of 47
- **Departments**: 10 departments
- **Roles**: 27 roles

## Structure

### Departments Included:
1. Leadership & Strategy (3 roles)
2. Health Economics & Outcomes Research (HEOR) (8 roles)
3. Value, Evidence & Outcomes (VEO) (6 roles)
4. Pricing & Reimbursement Strategy (7 roles)
5. Payer Relations & Contracting (6 roles)
6. Patient Access & Services (6 roles)
7. Government & Policy Affairs (5 roles)
8. Trade & Distribution (4 roles)
9. Market Access Analytics & Insights (4 roles)
10. Market Access Operations & Excellence (4 roles)

## How to Use

### Prerequisites
1. Ensure the Market Access function exists in `org_functions` table
2. Verify tenant_id `f7aa6fd4-0af9-4706-8b31-034f1f7accda` exists
3. Database schema must include all required tables and enums

### Running the Seed File

#### Via psql:
```bash
PGPASSWORD='your_password' psql postgresql://postgres:password@host:port/database \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1.sql
```

#### Via Supabase:
```bash
psql "postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1.sql
```

### Expected Output
```
NOTICE:  Using Market Access function ID: <uuid>
NOTICE:  Successfully loaded 27 roles from Market Access Part 1
```

## Data Model

### Role Attributes
Each role includes comprehensive data:

- **Core Info**: name, slug, description, seniority, leadership level
- **Team Structure**: team size, direct reports, span of control
- **Experience**: years required (total, industry, function)
- **Education**: degree requirements, preferred degrees, credentials
- **Budget Authority**: budget ranges, approval limits, headcount control
- **Compensation**: salary ranges, equity, bonuses, LTIP
- **Geography**: scope (global/regional/country), regions, countries
- **Therapeutic Areas**: primary and secondary TAs with expertise levels
- **Company Context**: typical company sizes and types
- **Stakeholders**: internal and external stakeholders with interaction levels
- **Technology**: platforms used and proficiency levels
- **Activities & KPIs**: key activities and measurable KPIs
- **Career Progression**: typical prior/next roles, lateral moves, time in role
- **Travel**: travel percentage, international travel requirements
- **Compliance**: regulatory and compliance requirements
- **Regional Variations**: US, EU, APAC-specific requirements

## Regenerating the Seed File

If you need to regenerate the seed file from the JSON source:

```bash
python3 scripts/generate_market_access_roles_seed.py
```

The script will:
1. Read the normalized JSON file
2. Generate INSERT statements for departments and roles
3. Include upsert logic (ON CONFLICT) to prevent duplicates
4. Output to `database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1.sql`

## Schema Dependencies

### Required Tables:
- `org_functions` - Function/department taxonomy
- `org_departments` - Department structure within functions
- `org_roles` - Role definitions

### Required Enums:
- `seniority_level` - e.g., executive, senior, mid, junior
- `span_of_control_type` - e.g., individual_contributor, people_manager
- `budget_authority_type` - e.g., none, limited, moderate, full
- `approval_limit_type` - e.g., manager_approved, director_approved
- `geographic_scope_type` - e.g., country, regional, global

### JSONB Columns:
- `prior_roles`, `preferred_degrees`, `credentials_required`, `credentials_preferred`
- `geographic_regions`, `geographic_countries`
- `therapeutic_areas`, `company_sizes`, `company_types`
- `internal_stakeholders`, `external_stakeholders`
- `technology_platforms`, `key_activities`, `kpis`
- `lateral_moves`, `compliance_requirements`, `regional_variations`

## Notes

### Conflict Resolution
The seed file uses `ON CONFLICT (tenant_id, slug) DO UPDATE` to:
- Insert new records if they don't exist
- Update existing records with matching tenant_id + slug
- Preserve data integrity while allowing re-runs

### Part 2
This is Part 1 of 2. A second file will contain roles 28-47 when available.

## Validation

After running the seed file, validate with:

```sql
-- Check department count
SELECT COUNT(*) FROM org_departments
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id IN (
    SELECT id FROM org_functions
    WHERE slug = 'market-access'
  );
-- Expected: 10

-- Check role count
SELECT COUNT(*) FROM org_roles
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id IN (
    SELECT id FROM org_functions
    WHERE slug = 'market-access'
  );
-- Expected: 27

-- View roles by department
SELECT
  d.name as department,
  COUNT(r.id) as role_count
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

### "Market Access function not found"
Ensure the org_functions table has a record with:
- `tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'`
- `slug = 'market-access'`
- `is_active = true`

### Enum type errors
Check that all required enum types exist in your database schema.

### JSONB casting errors
Verify that columns accepting JSONB data are properly defined in the schema.
