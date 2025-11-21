# Role Mapping from JSON File

## Overview

This document describes the process of mapping roles from `PHARMA_ROLE_SCOPE_NORMALIZED.json` to the Pharmaceuticals tenant's organizational structure (functions and departments).

## Files Created

1. **`map_roles_from_json.js`** - Node.js script that parses the JSON file and generates SQL
2. **`map_roles_from_json_generated.sql`** - Generated SQL file (14,000+ lines, one statement per role)
3. **`map_roles_from_json_optimized.sql`** - Optimized SQL script using temporary table and loop (recommended)
4. **`identify_missing_roles.sql`** - Script to identify missing roles before mapping
5. **`role_mapping_summary.json`** - Summary statistics from JSON analysis

## JSON File Analysis

- **Total JSON entries**: 483 (includes scope variations: Global, Regional, Local)
- **Unique roles**: 161 (ignoring scope variations)
- **Functions covered**: 4
  - Medical Affairs: 37 roles
  - Market Access: 41 roles
  - Commercial Organization: 45 roles
  - Regulatory Affairs: 38 roles

## Process

### Step 1: Identify Missing Roles

Run `identify_missing_roles.sql` to see:
- Roles in JSON but not in database
- Roles in database but not in JSON (orphaned)
- Summary counts

```sql
-- Run this first
\i identify_missing_roles.sql
```

### Step 2: Map All Roles

Run the optimized mapping script:

```sql
-- Recommended: Use the optimized version
\i map_roles_from_json_optimized.sql
```

This script will:
1. Create a temporary table with all unique roles from JSON
2. For each role:
   - Find matching function and department
   - Create role if it doesn't exist
   - Update existing role with correct function/department mapping
3. Report summary statistics

### Alternative: Regenerate SQL from JSON

If the JSON file is updated, regenerate the SQL:

```bash
cd .claude/vital-expert-docs/10-knowledge-assets/org_structure
node map_roles_from_json.js
```

This will regenerate `map_roles_from_json_generated.sql` and `role_mapping_summary.json`.

## Expected Results

After running the mapping script, you should see:

- **Roles created**: Number of new roles added to database
- **Roles mapped**: Number of existing roles updated with correct function/department
- **Roles with missing functions**: Roles where the function wasn't found (should be 0 if functions are properly set up)

## Verification

After mapping, verify the results:

```sql
-- Check mapping status
SELECT 
    CASE 
        WHEN r.function_id IS NULL AND r.department_id IS NULL THEN 'UNMAPPED'
        WHEN r.function_id IS NOT NULL AND r.department_id IS NULL THEN 'FUNCTION_ONLY'
        WHEN r.function_id IS NOT NULL AND r.department_id IS NOT NULL THEN 'FULLY_MAPPED'
    END as mapping_status,
    COUNT(*) as role_count
FROM public.org_roles r
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
GROUP BY mapping_status
ORDER BY mapping_status;
```

## Notes

1. **Scope Variations**: The JSON file contains the same role with different scopes (Global, Regional, Local). The mapping script creates one role per unique role name, ignoring scope variations.

2. **Function/Department Matching**: The script matches functions and departments by exact name. Ensure that:
   - Function names in database match exactly (e.g., "Medical Affairs", not "Medical Affairs-pharma-xxx")
   - Department names match exactly (e.g., "Field Medical", not "Field Medical-pharma-xxx")

3. **Unique IDs**: New roles are created with a `unique_id` in the format: `role-{slug}-{uuid-suffix}`

4. **Idempotency**: The script can be run multiple times safely. It uses `ON CONFLICT DO NOTHING` for inserts and only updates when values change.

## Troubleshooting

### Roles Not Being Created

- Check that functions exist: `SELECT name FROM org_functions WHERE tenant_id = ...`
- Check that departments exist: `SELECT name FROM org_departments WHERE tenant_id = ... AND function_id = ...`
- Verify tenant ID is correct

### Roles Not Being Mapped

- Check for name mismatches (case sensitivity, extra spaces, special characters)
- Verify function and department names match exactly between JSON and database
- Check for duplicate roles with different names

### Missing Functions/Departments

If functions or departments are missing, ensure they were created by running:
- `populate_pharma_org_fresh.sql` (for functions and departments)

## Next Steps

After successful mapping:
1. Verify all roles are mapped correctly
2. Check for any unmapped roles and investigate
3. Update role descriptions if needed
4. Consider adding scope information to roles (if needed for future use)

