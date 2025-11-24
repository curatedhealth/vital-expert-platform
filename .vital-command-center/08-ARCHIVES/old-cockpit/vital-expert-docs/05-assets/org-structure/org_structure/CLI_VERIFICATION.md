# CLI Verification Guide

## Quick Verification Query

The simplest way to verify the consolidation is to run this query in Supabase SQL Editor:

```sql
-- Quick Summary
SELECT 
    'Total Functions' as metric,
    COUNT(DISTINCT f.id)::text as value
FROM public.org_functions f
INNER JOIN public.tenants t ON f.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'Total Departments',
    COUNT(DISTINCT d.id)::text
FROM public.org_departments d
INNER JOIN public.tenants t ON d.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'Total Roles',
    COUNT(DISTINCT r.id)::text
FROM public.org_roles r
INNER JOIN public.tenants t ON r.tenant_id = t.id
WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
UNION ALL
SELECT 
    'Duplicate Functions',
    COUNT(*)::text
FROM (
    SELECT f.name::text
    FROM public.org_functions f
    INNER JOIN public.tenants t ON f.tenant_id = t.id
    WHERE t.slug = 'pharmaceuticals' OR t.name ILIKE '%pharmaceutical%'
    GROUP BY f.name::text
    HAVING COUNT(*) > 1
) duplicates;
```

## Expected Results

- **Total Functions**: 15 (matches comprehensive list)
- **Total Departments**: 98 (matches comprehensive list)
- **Total Roles**: ~928 (all roles preserved)
- **Duplicate Functions**: 0 (all duplicates merged)

## Using Supabase SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new
2. Copy the query above
3. Paste and click "Run"
4. Verify results match expected values

## Using psql (If you have connection string)

```bash
psql "YOUR_CONNECTION_STRING" -f .claude/vital-expert-docs/10-knowledge-assets/org_structure/verify_summary.sql
```

## Full Verification

For complete verification, run `verify_consolidated_pharma_org.sql` which shows:
- All functions with counts
- All departments by function
- Summary statistics
- Duplicate check

